# Git-Slug
## install
`npm i -S git-slug`
## use
```
const gitSlug = require('git-slug');
const pathResolve = require('path').resolve;

gitSlug(pathResolve(__dirname, './')).then(console.log).catch(console.error);
```
## result
```
{
  host: 'github.com',
  owner: 'user',
  repo: 'repo',
  branch: 'master'
}
```
## from
data parse from `git remote show -n <remote-tag>` and `git branch -vV`
