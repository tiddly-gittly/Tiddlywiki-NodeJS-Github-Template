const path = require('path');
const os = require('os');
const execSync = require('child_process').execSync;

const wikiFolderName = require('../package.json').name;
const privateWikiName = require('../package.json').privateWikiName;

const repoFolder = path.join(path.dirname(__filename), '..');

const tiddlyWikiFolder = path.join(repoFolder, wikiFolderName);

const execAndLog = (command, options) => console.log(String(execSync(command, options)));

module.exports = function installPrivateRepo() {
  if (os.platform() === 'darwin') {
    execAndLog(`cd ./${wikiFolderName}/tiddlers && ln -sfn ../../../${privateWikiName} ./${privateWikiName}`, {
      cwd: repoFolder,
    });
  } else if (os.platform() === 'win32') {
    execAndLog(`cd ./${wikiFolderName}/tiddlers && mklink /D/J .\\${privateWikiName} ..\\..\\..\\${privateWikiName}`, {
      cwd: repoFolder,
    });
  } else {
    execAndLog(`cd ./${wikiFolderName}/tiddlers && ln -sfn ../../../${privateWikiName} ./${privateWikiName}`, {
      cwd: repoFolder,
    });
  }
};
