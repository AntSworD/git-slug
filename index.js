'use strict';

const exec = require('child_process').execFile;
const resolvePath = require('path').resolve;

module.exports = (path, remote = 'origin') => {
  return Promise.resolve().then(() => {
    path = resolvePath(path);

    let gitRemoteArgs = ['remote', 'show', '-n', remote];
    let gitBranchArgs = ['branch', '-vv'];
    let matchFetch = /Fetch URL: (.+)/;
    // * master 234872 [origin/master] commit message
    // 匹配出 branch
    let matchBranch = /\*\s+([^\s]+)\s+.+\s+\[([^\s]+)\/([^\:]+).*\]\s+.+/;

    let getRemoteInfo = new Promise((resolve, reject) => {
        exec('git', gitRemoteArgs, {cwd: path}, function (err, stdout) {
          // console.log(stdout);
          if (!err && stdout) {
            let remoteMatch = matchFetch.exec(stdout.toString());

            if (remoteMatch) {
              let result = parseUrl(remoteMatch[1].trim());
              if (result) return resolve(result);
            };

            return reject(new Error('Not a available GIT remote URL'));
          } else {
            return reject(new Error('Git remote show stdout no available'))
          }
        });
    });

    let getBranchInfo = new Promise((resolve, reject) => {
      exec('git', gitBranchArgs, {cwd: path}, function (err, stdout) {
          // console.log(matchBranch.exec(stdout.toString()));
          if (!err && stdout) {
            let branchMatch = matchBranch.exec(stdout.toString());
            if (branchMatch) {
              let [localBranch, remoteTag, remoteBranch] = branchMatch.slice(1);
              if (remote === remoteTag) {
                return resolve(remoteBranch);
              }
              return reject(new Error(`Need \`git branch -vv\` mark to remote tag ${ remote } `));
            }

            return reject(new Error('Not a available GIT branch URL'));
          } else {
            return reject(new Error('Git branch stdout no available'))
          }
        });
    });

    return Promise.all([getRemoteInfo, getBranchInfo]);
  }).then(([[host, owner, repo], branch]) => {
    let slug = {
      host,
      owner,
      repo,
      branch
    };

    return slug;
  }).catch((e) => {
    throw e;
  });
};

let parseUrl = (gitUrl) => {
  let matchGitUrl = /^(?:https?:\/\/|git:\/\/|git\+ssh:\/\/|git\+https:\/\/)?(?:[^@]+@)?([^\/]+)(?::\/?|\/)([^/]+\/[^/]+?|[0-9]+)$/;
  let matchOwnerRepo = /^([^\/]+)\/([^\/]+)/;

  let matchGit = matchGitUrl.exec(gitUrl.replace(/\.git(#.*)?$/, ''));
  if (!matchGit) return null;

  let matchRepo = matchOwnerRepo.exec(matchGit[2]);
  if (!matchRepo) return null;

  return [matchGit[1]].concat(matchRepo.slice(1));
}
