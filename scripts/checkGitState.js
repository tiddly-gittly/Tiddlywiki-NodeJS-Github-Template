const git = require('git-state');
const util = require('util');

function promisify(func) {
  return (...param) =>
    new Promise((resolve) => {
      func(...param, (returnValue) => resolve(returnValue));
    });
}

module.exports.isUnsync = async function isUnsync(repoPath) {
  if (!(await promisify(git.isGit)(repoPath))) {
    throw new Error(`${repoPath} is not a git repo.`);
  }
  const { branch, ahead, dirty, untracked, stashes } = await util.promisify(git.check)(repoPath);
  if (ahead + dirty + untracked + stashes === 0) return false;
  return {
    unsync: ahead > 0,
    uncommit: dirty + untracked + stashes,
  };
}
