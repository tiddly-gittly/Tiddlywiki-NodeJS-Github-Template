const path = require('path');
const execSync = require('child_process').execSync;

const wikiFolderName = require('../package.json').name;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

// cross-env TIDDLYWIKI_PLUGIN_PATH='node_modules/tiddlywiki/plugins/published' TIDDLYWIKI_THEME_PATH='${wikiFolderName}/themes'
process.env['TIDDLYWIKI_PLUGIN_PATH'] = `${tiddlyWikiFolder}/plugins`;
process.env['TIDDLYWIKI_THEME_PATH'] = `${tiddlyWikiFolder}/themes`;

const execAndLog = (command, options) => console.log(String(execSync(command, options)));

module.exports = function build() {
  // npm run build:prepare
  execAndLog(`rm -rf ${repoFolder}/public`);
  // npm run build:public
  execAndLog(
    `cp -r ${tiddlyWikiFolder}/public/ ./public && cp ${tiddlyWikiFolder}/tiddlers/favicon.ico ./public/favicon.ico && cp ${tiddlyWikiFolder}/tiddlers/TiddlyWikiIconWhite.png ./public/TiddlyWikiIconWhite.png && cp ${tiddlyWikiFolder}/tiddlers/TiddlyWikiIconBlack.png ./public/TiddlyWikiIconBlack.png`,
    { cwd: repoFolder }
  );
  // npm run build:nodejs2html
  execAndLog(`tiddlywiki ${wikiFolderName} --build externalimages`, { cwd: repoFolder });
  // npm run build:sitemap
  execAndLog(
    `tiddlywiki ${wikiFolderName} --rendertiddler sitemap sitemap.xml text/plain && mv ${tiddlyWikiFolder}/output/sitemap.xml ./public/sitemap.xml`,
    { cwd: repoFolder }
  );
  // npm run build:minifyHTML
  execAndLog(
    `html-minifier-terser -c ./html-minifier-terser.config.json -o ./public/index.html ${tiddlyWikiFolder}/output/index.html`,
    { cwd: repoFolder }
  );
  // npm run build:precache
  execAndLog(`workbox injectManifest workbox-config.js`, { cwd: repoFolder });
  // npm run build:clean
  execAndLog(`rm -r ${tiddlyWikiFolder}/output`, { cwd: repoFolder });
  // npm run build:pluginLibrary
  // execAndLog(`tiddlywiki ${wikiFolderName} --output public/library --build library`, { cwd: repoFolder });
};
