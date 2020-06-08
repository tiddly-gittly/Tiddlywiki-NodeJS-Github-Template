const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const wikiFolderName = require('../package.json').name;
const privateWikiName = require('../package.json').privateWikiName;
const COMMIT_INTERVAL = (1000 * 60 * 60) / 2;

const tiddlyWikiRepo = path.join(path.dirname(__filename), '..');
module.exports.tiddlyWikiRepo = tiddlyWikiRepo;

const tiddlyWikiFolder = path.join(tiddlyWikiRepo, wikiFolderName);

const privateTiddlyWikiRepo = path.join(tiddlyWikiRepo, '..', privateWikiName);
module.exports.privateTiddlyWikiRepo = privateTiddlyWikiRepo;
const privateTiddlyWikiFolder = path.join(tiddlyWikiRepo, '..', privateWikiName);

const commitScriptPath = path.resolve(tiddlyWikiRepo, 'scripts', 'commit.sh');
const syncScriptPath = path.resolve(tiddlyWikiRepo, 'scripts', 'sync.sh');
const frequentlyChangedFileThatShouldBeIgnoredFromWatch = ['output', 'tiddlers/$__StoryList.tid'];
const topLevelFoldersToIgnored = ['node_modules', '.git'];

/** https://davidwalsh.name/javascript-debounce-function */
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function syncToGit(folder) {
  console.log(`Sync to Git: /bin/sh ${syncScriptPath} under ${folder}`);
  execSync(`git config --bool branch.master.sync true`, { cwd: folder });
  execSync(`/bin/sh ${syncScriptPath}`, { cwd: folder });
}

const commitAndSync = (folderPath) => {
  if (!folderPath) {
    const errorString = 'no folderPath as parameter';
    console.error(errorString);
    return errorString;
  }
  try {
    try {
      execSync(`/bin/sh ${commitScriptPath}`, { cwd: folderPath });
    } catch (commitError) {
      /* sometimes it is just false alarm:
      stdout:
        On branch master
      Your branch is ahead of 'origin/master' by 1 commit.
        (use "git push" to publish your local commits)

      nothing to commit, working tree clean

      stderr:
      */
      if (commitError.stderr && commitError.stderr.toString('utf8').length > 0) {
        throw commitError;
      }
      commitError.stdout && console.warn(commitError.stdout.toString('utf8'));
    }
    syncToGit(folderPath);
  } catch (error) {
    const errorString = `\nSync failed
    stdout:
    ${error.stdout ? error.stdout.toString('utf8') : '\n'}
    stderr:
    ${error.stderr ? error.stderr.toString('utf8') : '\n'}
    raw:
    `;
    console.error(errorString);
    console.error(error);
    return errorString;
  }
};
module.exports.commitAndSync = commitAndSync;
module.exports.commitAndSyncAll = function commitAndSyncAll() {
  commitAndSync(tiddlyWikiRepo);
  commitAndSync(privateTiddlyWikiRepo);
};
const debounceCommitAndSync = debounce(commitAndSync, COMMIT_INTERVAL);

function watchFolder(wikiFolderPath, repoPath) {
  fs.watch(
    wikiFolderPath,
    { recursive: true },
    debounce((_, fileName) => {
      if (topLevelFoldersToIgnored.some((name) => fileName.startsWith(name))) return;
      if (frequentlyChangedFileThatShouldBeIgnoredFromWatch.includes(fileName)) return;
      console.log(`${fileName} change`);

      debounceCommitAndSync(repoPath);
    }, 100)
  );
  console.log(`wiki watch ${wikiFolderPath} now`);
}

module.exports.watchWiki = function watchWiki() {
  watchFolder(tiddlyWikiFolder, tiddlyWikiRepo);
  if (fs.existsSync(privateTiddlyWikiRepo)) {
    watchFolder(privateTiddlyWikiFolder, privateTiddlyWikiRepo);
  }
};
