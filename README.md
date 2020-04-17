# Tiddlywiki-NodeJS-Github-Template

Knowledge base Template, with advanced filter search and faceted data aggregation.

[wiki.onetwo.ren](https://wiki.onetwo.ren/) is an example of this template. And [tiddlywiki-nodejs-github-template.now.sh](https://tiddlywiki-nodejs-github-template.now.sh/) is deployed example of this repo.

This repo contains the wiki backup data and script to start a local wiki server on MacOS on start up.

The wiki is minimized using modern web dev-tool, and accompany with a service worker to make it a PWA.

## Setup

[用TiddlyWiki替代Notion和EverNote作为个人知识管理系统 (Chinese)](https://onetwo.ren/%E7%94%A8tiddlywiki%E6%9B%BF%E4%BB%A3notion%E5%92%8Cevernote%E7%AE%A1%E7%90%86%E7%9F%A5%E8%AF%86/)

English translation comeout soon.

## Deployed to Now.sh

Procedure to deploy: [使用 Now.sh 部署 TiddlyWiki (Chinese)](https://wiki.onetwo.ren/#%E4%BD%BF%E7%94%A8%20Now.sh%20%E9%83%A8%E7%BD%B2%20TiddlyWiki)

## Configs

In `package.json` there is `port` for local server to listen, and `name` for the tiddlywiki data folder name.

In `now.json` there is config for deployment, see [zeit.co](https://zeit.co/home) for detail.

## NPM Scripts

`npm run install:wikiServer`: install service that will start a local wiki server on MacOS on start up. And it will start the localhost server immediately

`npm run install:privateRepo`: create soft link to `../private-MyTiddlyWiki`, so tiddlywiki will load tiddlers and images in that private repo

`npm run uninstall:wikiServer`: uninstall start up script, and shut down the server immediately

`npm run install:windows:wikiServer` `npm run install:privateRepo` `npm run uninstall:windows:wikiServer` are Windows version of above commands

`npm run start:wikiServer`: start local tiddlywiki server.

`npm build` and `npm run build:nodejs2html`: pack tiddlywiki data to a HTML file

`npm run build:public`: copy things from `./PublicWiki/public` to `/public`, so they can be served by a static server

`npm run build:sitemap`: generate sitemap point to `wiki.onetwo.ren`

`npm run build:precache`: use workbox to modify `/public/service-worker.js` to precache things under `/public`

`npm run build:minifyHTML`: use terser and other things to reduce bundle size

`npm run build:prepare` `npm run build:clean`: delete generated folders

## Shell Scripts

[scripts/commit.sh](scripts/commit.sh) will commit things to local git

[scripts/sync.sh](scripts/sync.sh) will sync text to Github, automatically merge and resolve dirty things

## Debug

If your wiki not started, and error log under `/Library/Logs/TiddlyWiki` shows a permission error: [coreybutler/node-mac/issues/28](https://github.com/coreybutler/node-mac/issues/28)

## Credit

Scripts are inspired by [DiamondYuan/wiki](https://github.com/DiamondYuan/wiki)
