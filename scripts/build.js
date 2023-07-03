const path = require('path');
const {
    execSync
} = require('child_process');

/** 项目路径 */
const repoFolder = path.join(path.dirname(__filename), '..');
/** 获得TW版本号 */
const getVersion = '$(npx tiddlywiki . --version | grep -Eo \'^[0-9]+\.[0-9]+\.[0-9]+.*$\' | head -n 1)';

/** 设置环境变量，TW会同时在自己的源码路径以及环境变量定义的路径中寻找插件、主题和语言
 *  如果不这样写，plugins、themes、languages和editions里的内容就无法被加载
 */
process.env.TIDDLYWIKI_PLUGIN_PATH = `${repoFolder}/plugins`;
process.env.TIDDLYWIKI_THEME_PATH = `${repoFolder}/themes`;
process.env.TIDDLYWIKI_LANGUAGE_PATH = `${repoFolder}/languages`;
process.env.TIDDLYWIKI_EDITION_PATH = `${repoFolder}/editions`;

/**
 * 执行命令行指令，并打印该指令的结果
 * @param {string} command 要执行的命令
 * @param {object} options execSync的参数
 */
function shell(command, options) {
    if (options !== undefined) options = {};
    console.log(String(execSync(command, {
        cwd: repoFolder,
        ...options,
    })));
}
/**
 * 执行命令行指令，并打印该指令的结果，同时忽略任何错误
 * @param {string} command 要执行的命令
 * @param {object} options execSync的参数
 */
function shellI(command, options) {
    try {
        shell(command, options);
    } catch (error) {
        console.error(`[Shell Command Error] ${error}`)
    }
}

/**
 * 构建在线HTML版本：核心JS和资源文件不包括在HTML中， 下载后不能使用
 * @param {string} distDir 目标路径，空或者不填则默认为'dist'
 * @param {string} htmlName HTML名称，空或者不填则默认为'index.html'
 * @param {boolean} minify 是否最小化JS和HTML，默认为true
 * @param {string} excludeFilter 要排除的tiddler的过滤表达式，默认为'-[is[draft]]'
 */
function buildOnlineHTML(distDir, htmlName, minify, excludeFilter) {
    if (typeof distDir !== 'string' || distDir.length === 0) distDir = 'dist';
    if (typeof htmlName !== 'string' || htmlName.length === 0) htmlName = 'index.html';
    if (typeof minify !== 'boolean') minify = true;
    if (typeof excludeFilter !== 'string') excludeFilter = '-[is[draft]]';

    // 清空生成目标
    shell(`rm -rf ${distDir}`);

    // 静态资源拷贝
    shellI(`cp -r public/ ${distDir} &> /dev/null`);
    shellI(`cp tiddlers/favicon.ico ${distDir}/favicon.ico &> /dev/null`);
    shellI(`cp vercel.json ${distDir}/vercel.json &> /dev/null`);

    // 构建HTML
    shell('cp -r tiddlers/ tmp_tiddlers_backup &> /dev/null'); // 备份 因为下面有改变tiddler的field的操作(媒体文件全部转为canonical)
    shell(`npx tiddlywiki . --output ${distDir}` +
        ' --deletetiddlers \'[[$:/UpgradeLibrary]] [[$:/UpgradeLibrary/List]]\'' +
        ' --setfield \'[is[image]] [is[binary]] [type[application/msword]] [type[image/svg+xml]]\' _canonical_uri $:/core/templates/canonical-uri-external-image text/plain' +
        ' --setfield \'[is[image]] [is[binary]] [type[application/msword]] [type[image/svg+xml]]\' text "" text/plain' + /* 注意这一步也会把所有媒体文件的内容变成空的 */
        ` --rendertiddler $:/core/save/offline-external-js index-raw.html text/plain "" publishFilter "${excludeFilter}"` +
        ' --rendertiddler $:/core/templates/tiddlywiki5.js tiddlywikicore.js text/plain'
    );
    shell('cp -r tmp_tiddlers_backup/* tiddlers &> /dev/null'); // 恢复被清空内容的媒体文件
    // 删除非二进制文件，后缀类型定义在 boot.js ($tw.utils.registerFileType(...))
    shellI('cd tiddlers && rm *.meta *.tid *.multids *.tiddler *.recipe *.txt *.css *.html *.htm *.hta *.js *.json *.md *.bib &> /dev/null');
    shellI(`mkdir ${distDir}/images &> /dev/null`);
    shell(`mv tiddlers/*.* ${distDir}/images &> /dev/null`); // 非二进制文件也就是资源文件的拷贝
    shell('rm -rf tiddlers && mv tmp_tiddlers_backup tiddlers &> /dev/null'); // 还原

    // 最小化：核心JS和HTML
    if (minify) {
        shellI(`npx uglifyjs ${distDir}/tiddlywikicore.js -c -m --v8 --webkit --ie --output '${distDir}/tiddlywikicore-'${getVersion}'.js' && rm ${distDir}/tiddlywikicore.js`);
        shellI(`npx html-minifier-terser -c scripts/html-minifier-terser.config.json -o ${distDir}/${htmlName} ${distDir}/index-raw.html && rm ${distDir}/index-raw.html`);
    } else {
        shellI(`mv ${distDir}/tiddlywikicore.js '${distDir}/tiddlywikicore-'${getVersion}'.js'`);
        shellI(`mv ${distDir}/index-raw.html ${distDir}/${htmlName}`);
    }
}

/**
 * 构建离线HTML版本：核心JS和资源文件包括在HTML中， 下载后可以使用(就是单文件版本的wiki)
 * @param {string} distDir 目标路径，空或者不填则默认为'dist'
 * @param {string} htmlName HTML名称，空或者不填则默认为'index.html'
 * @param {boolean} minify 是否最小化JS和HTML，默认为true
 * @param {string} excludeFilter 要排除的tiddler的过滤表达式，默认为'-[is[draft]]'
 */
function buildOfflineHTML(distDir, htmlName, minify, excludeFilter) {
    if (typeof distDir !== 'string' || distDir.length === 0) distDir = 'dist';
    if (typeof htmlName !== 'string' || htmlName.length === 0) htmlName = 'index.html';
    if (typeof minify !== 'boolean') minify = true;
    if (typeof excludeFilter !== 'string') excludeFilter = '-[is[draft]]';

    // 构建HTML
    shell(`npx tiddlywiki . --output ${distDir}` +
        ' --deletetiddlers \'[[$:/UpgradeLibrary]] [[$:/UpgradeLibrary/List]]\'' +
        ` --rendertiddler $:/plugins/tiddlywiki/tiddlyweb/save/offline index-raw.html text/plain "" publishFilter "${excludeFilter}"`
    );

    // 最小化：HTML
    if (minify) {
        shellI(`npx html-minifier-terser -c scripts/html-minifier-terser.config.json -o ${distDir}/${htmlName} ${distDir}/index-raw.html && rm ${distDir}/index-raw.html`);
    } else {
        shellI(`mv ${distDir}/index-raw.html ${distDir}/${htmlName}`);
    }
}

/**
 * 构建插件源
 * @param {string} pluginFilter 要发布插件的过滤器，默认为 '[prefix[$:/plugins/]!prefix[$:/plugins/tiddlywiki/]!prefix[$:/languages/]!prefix[$:/themes/tiddlywiki/]!tag[$:/tags/PluginLibrary]]'
 * @param {string} distDir 目标路径，空或者不填则默认为'dist/library'
 * @param {boolean} minify 是否最小化HTML，默认为true
 */
function buildLibrary(pluginFilter, distDir, minify) {
    if (typeof pluginFilter !== 'string' || pluginFilter.length === 0) pluginFilter = '[prefix[$:/plugins/]!prefix[$:/plugins/tiddlywiki/]!prefix[$:/languages/]!prefix[$:/themes/tiddlywiki/]!tag[$:/tags/PluginLibrary]]';
    if (typeof distDir !== 'string' || distDir.length === 0) distDir = 'dist/library';
    if (typeof minify !== 'boolean') minify = true;

    shell(`npx tiddlywiki . --output ${distDir}` +
        ' --makelibrary $:/UpgradeLibrary' +
        ` --savelibrarytiddlers $:/UpgradeLibrary ${pluginFilter} recipes/library/tiddlers/ $:/UpgradeLibrary/List` +
        ' --savetiddler $:/UpgradeLibrary/List recipes/library/tiddlers.json' +
        ' --rendertiddler $:/plugins/tiddlywiki/pluginlibrary/library.template.html index-raw.html text/plain' +
        ' --deletetiddlers \'[[$:/UpgradeLibrary]] [[$:/UpgradeLibrary/List]]\'', { env: { TIDDLYWIKI_PLUGIN_PATH: path.resolve(distDir, '..', 'plugins')}}
    );

    // 最小化：HTML
    if (minify) {
        shellI(`npx html-minifier-terser -c scripts/html-minifier-terser.config.json -o ${distDir}/index.html ${distDir}/index-raw.html && rm ${distDir}/index-raw.html`);
    } else {
        shellI(`mv ${distDir}/index-raw.html ${distDir}/${htmlName}`);
    }
}

module.exports = {
    buildOnlineHTML: buildOnlineHTML,
    buildOfflineHTML: buildOfflineHTML,
    buildLibrary: buildLibrary,
};
