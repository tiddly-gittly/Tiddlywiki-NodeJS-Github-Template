#!/usr/bin/env zx
import { fs } from 'zx';
import path from 'path';
import { execSync } from 'child_process';

const repoFolder = path.join(path.dirname(__filename), '..');
const folderToServe = path.join(repoFolder, 'public-dist');

// 设置环境变量
process.env.TIDDLYWIKI_PLUGIN_PATH = `${repoFolder}/plugins`;
process.env.TIDDLYWIKI_THEME_PATH = `${repoFolder}/themes`;
process.env.TIDDLYWIKI_LANGUAGE_PATH = `${repoFolder}/languages`;
process.env.TIDDLYWIKI_EDITION_PATH = `${repoFolder}/editions`;

/**
 * 执行命令
 */
function exec(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: repoFolder, stdio: 'inherit' });
}

/**
 * 执行命令，忽略错误
 */
function execIgnoreError(cmd) {
  try {
    exec(cmd);
  } catch (error) {
    console.log(`⚠ Skipped: ${error.message.split('\n')[0]}`);
  }
}

/**
 * 构建在线HTML版本
 */
async function buildOnlineHTML() {
  console.log('\n📦 Building Online HTML...');
  
  // 清空并创建输出目录
  await fs.remove(folderToServe);
  await fs.ensureDir(folderToServe);
  
  // 复制静态文件
  await fs.copy(path.join(repoFolder, 'public'), folderToServe);
  try {
    await fs.copy(path.join(repoFolder, 'vercel.json'), path.join(folderToServe, 'vercel.json'));
  } catch (e) {
    console.log('⚠ vercel.json not found');
  }
  
  // 备份 tiddlers
  const tmpBackupDir = path.join(repoFolder, 'tmp_tiddlers_backup');
  try {
    await fs.remove(tmpBackupDir);
  } catch (e) {
    // ignore
  }
  const tiddlersPath = path.join(repoFolder, 'tiddlers');
  if (fs.existsSync(tiddlersPath)) {
    await fs.copy(tiddlersPath, tmpBackupDir);
  } else {
    console.warn('⚠ WARNING: tiddlers directory not found, skipping backup');
  }
  
  try {
    // 构建在线版本（媒体文件外化）
    exec(`tiddlywiki ${repoFolder} --output ${folderToServe} ` +
      `--deletetiddlers '[[$:/UpgradeLibrary]] [[$:/UpgradeLibrary/List]]' ` +
      `--setfield '[is[image]] [is[binary]] [type[application/msword]] [type[image/svg+xml]]' _canonical_uri $:/core/templates/canonical-uri-external-image text/plain ` +
      `--setfield '[is[image]] [is[binary]] [type[application/msword]] [type[image/svg+xml]]' text "" text/plain ` +
      `--rendertiddler $:/core/save/offline-external-js index-raw.html text/plain "" publishFilter "-[is[draft]]" ` +
      `--rendertiddler $:/core/templates/tiddlywiki5.js tiddlywikicore.js text/plain`);
      
    // 最小化JS
    try {
      const version = execSync('npx tiddlywiki . --version', { cwd: repoFolder, encoding: 'utf-8' }).trim();
      const versionStr = version.match(/^\d+\.\d+\.\d+/)?.[0] || '5.0.0';
      const jsPath = path.join(folderToServe, 'tiddlywikicore.js');
      const minifiedPath = path.join(folderToServe, `tiddlywikicore-${versionStr}.js`);
      exec(`npx uglifyjs ${jsPath} -c -m --v8 --webkit --ie --output ${minifiedPath}`);
      await fs.remove(jsPath);
    } catch (e) {
      console.log('⚠ JS minification skipped');
    }
    
    // 最小化HTML
    try {
      const configPath = path.join(repoFolder, 'scripts/html-minifier-terser.config.json');
      const rawHtmlPath = path.join(folderToServe, 'index-raw.html');
      const minifiedHtmlPath = path.join(folderToServe, 'index-minify.html');
      const finalHtmlPath = path.join(folderToServe, 'index.html');
      
      exec(`npx html-minifier-terser -c ${configPath} -o ${minifiedHtmlPath} ${rawHtmlPath}`);
      const htmlContent = fs.readFileSync(minifiedHtmlPath, 'utf-8');
      const htmlContentWithCorrectJsPath = htmlContent.replaceAll('%24%3A%2Fcore%2Ftemplates%2Ftiddlywiki5.js', 'tiddlywiki5.js');
      fs.writeFileSync(finalHtmlPath, htmlContentWithCorrectJsPath);
      await fs.remove(rawHtmlPath);
      await fs.remove(minifiedHtmlPath);
    } catch (e) {
      console.log('⚠ HTML minification skipped');
    }
    
    // 生成sitemap
    execIgnoreError(`tiddlywiki . --rendertiddler sitemap sitemap.xml text/plain`);
    try {
      await fs.copy(path.join(repoFolder, 'output/sitemap.xml'), path.join(folderToServe, 'sitemap.xml'));
    } catch (e) {
      console.log('⚠ sitemap.xml not generated');
    }
    
    // workbox
    execIgnoreError(`workbox injectManifest workbox-config.js`);
    
    console.log('✅ Online HTML built successfully');
  } finally {
    // 恢复 tiddlers
    try {
      if (fs.existsSync(tmpBackupDir)) {
        try {
          await fs.remove(path.join(repoFolder, 'tiddlers'));
        } catch (e) {
          // ignore
        }
        await fs.copy(tmpBackupDir, path.join(repoFolder, 'tiddlers'));
        await fs.remove(tmpBackupDir);
      }
    } catch (e) {
      console.error('❌ Error restoring tiddlers:', e.message);
    }
  }
}

/**
 * 构建离线HTML版本
 */
async function buildOfflineHTML() {
  console.log('\n📦 Building Offline HTML...');
  
  const offlineOutputDir = path.join(folderToServe, 'offline');
  await fs.ensureDir(offlineOutputDir);
  
  try {
    // 构建离线版本（所有资源包含）
    exec(`tiddlywiki ${repoFolder} --output ${offlineOutputDir} ` +
      `--deletetiddlers '[[$:/UpgradeLibrary]] [[$:/UpgradeLibrary/List]]' ` +
      `--rendertiddler $:/core/save/all index-raw.html text/plain "" publishFilter "-[is[draft]]"`);
    
    // 最小化HTML
    try {
      const configPath = path.join(repoFolder, 'scripts/html-minifier-terser.config.json');
      const rawHtmlPath = path.join(offlineOutputDir, 'index-raw.html');
      const minifiedHtmlPath = path.join(offlineOutputDir, 'index-minify.html');
      const finalHtmlPath = path.join(offlineOutputDir, 'index.html');
      
      exec(`npx html-minifier-terser -c ${configPath} -o ${minifiedHtmlPath} ${rawHtmlPath}`);
      await fs.remove(rawHtmlPath);
      await fs.move(minifiedHtmlPath, finalHtmlPath, { overwrite: true });
    } catch (e) {
      console.log('⚠ HTML minification skipped, renaming raw HTML');
      try {
        await fs.move(path.join(offlineOutputDir, 'index-raw.html'), 
                      path.join(offlineOutputDir, 'index.html'), { overwrite: true });
      } catch (err) {
        console.error('❌ Failed to prepare HTML');
      }
    }
    
    // 清理其他文件
    try {
      const files = await fs.readdir(offlineOutputDir);
      for (const file of files) {
        if (file !== 'index.html') {
          await fs.remove(path.join(offlineOutputDir, file));
        }
      }
    } catch (e) {
      // ignore
    }
    
    console.log('✅ Offline HTML built successfully');
  } catch (error) {
    console.error('❌ Error building offline HTML:', error.message);
    throw error;
  }
}

// 执行构建
try {
  await buildOnlineHTML();
  await buildOfflineHTML();
  console.log('\n🎉 All builds completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
