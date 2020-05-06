const path = require('path');
const os = require('os');
const execSync = require('child_process').execSync;
const { existsSync } = require('fs');

let Service;
if (os.platform() === 'darwin') {
  Service = require('node-mac-user').Service;
  if (!existsSync('/Library/Logs/TiddlyWiki')) {
    execSync('sudo mkdir -p /Library/Logs/TiddlyWiki && sudo chown -R $(whoami) /Library/Logs/TiddlyWiki');
  }
} else if (os.platform() === 'win32') {
  Service = require('node-windows').Service;
} else {
  Service = require('node-linux').Service;
}

module.exports = Service;
