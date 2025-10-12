[English](/README.md) | [中文](/README_zh-CN.md)

# Tiddlywiki-NodeJS-Github-Template

Default wiki template for [TidGi-Desktop](https://github.com/tiddly-gittly/TidGi-Desktop), an App that can generate template wiki on one-click.

Knowledge base Template, with advanced filter search and faceted data aggregation.

[wiki.onetwo.website](https://wiki.onetwo.website/) is an example of this template. And [tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/](https://tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/) is deployed example of this repo. (There are some optimization to make this demo readonly, and being not downloadable, so its size is almost as small as a GIF picture.)

You need to change the contents of the `$:/GitHub/Repo` entry to your personal github repository address.The default branch is master, you can manually change the `$:/core/templates/canonical-uri-external-image` entry to another branch such as main.

Downloadable HTML is at [tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/offline.html](https://tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/offline.html), which contains edit related plugins, and will be slightly bigger (a size of a tiktok video.)

Also there is a TiddlyHost template at [tiddlyhost.com/hub/user/linonetwo](https://tiddlyhost.com/hub/user/linonetwo), which will update manually when I remember it. (It is same as, download the offline version above, and upload to a newly created tiddlyhost wiki.)

This repo used to contains the wiki backup data and script to start a local wiki server on MacOS on start up. It is now deprecated, and no money to maintain, now [TiddlyGit-Desktop](https://github.com/tiddly-gittly/TiddlyGit-Desktop) is preferred. Old version can be found at the [feat/auto-start branch](https://github.com/tiddly-gittly/Tiddlywiki-NodeJS-Github-Template/tree/feat/auto-start). Contribution to it is welcome.

## Setup

[用TiddlyWiki替代Notion和EverNote作为个人知识管理系统 (Chinese)](https://onetwo.ren/%E7%94%A8tiddlywiki%E6%9B%BF%E4%BB%A3notion%E5%92%8Cevernote%E7%AE%A1%E7%90%86%E7%9F%A5%E8%AF%86/)

English translation comeout soon. (?)

## Deployed to Github Pages

Automatically.

## NPM Scripts

`npm build`: pack tiddlywiki data to a HTML file

## Shell Scripts

[scripts/build-wiki.js](scripts/build-wiki.js) will actually pack tiddlywiki data to a HTML file

## Credit

Scripts are inspired by [DiamondYuan/wiki](https://github.com/DiamondYuan/wiki)
