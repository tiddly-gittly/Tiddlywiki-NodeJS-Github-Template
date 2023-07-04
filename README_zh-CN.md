[English](/README.md) | [中文](/README_zh-CN.md)

# Tiddlywiki-NodeJS-Github-Template

[TidGi-Desktop](https://github.com/tiddly-gittly/TidGi-Desktop)的默认wiki模板，这是一个可以一键生成wiki模板的应用。

知识库模板，具有高级过滤搜索和分面数据聚合功能。

[onetwo.ren/wiki](https://onetwo.ren/wiki)是这个模板的一个例子。而[tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/](https://tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/)是这个repo的部署例子。(有一些优化，使这个演示只读，并且不能下载，所以它的大小几乎和GIF图片一样小。)

需要修改`$:/GitHub/Repo`条目内容为个人github仓库地址。默认分支是master，可以手动修改`$:/core/templates/canonical-uri-external-image`条目，改成其他比如main分支。

可下载的HTML在[tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/offline.html](https://tiddly-gittly.github.io/Tiddlywiki-NodeJS-Github-Template/offline.html)，其中包含编辑相关的插件，而且会稍微大一些（相当于一个tiktok视频的大小）。

这个 repo 曾经包含wiki的备份数据和脚本，用于在MacOS上启动本地wiki服务器。现在它已经被废弃了，而且没有钱去维护，现在[TiddlyGit-Desktop](https://github.com/tiddly-gittly/TiddlyGit-Desktop)是首选。旧版本可以在[feat/auto-start分支](https://github.com/tiddly-gittly/Tiddlywiki-NodeJS-Github-Template/tree/feat/auto-start)中找到。我们欢迎对它的贡献。

## 设置

[用TiddlyWiki替代Notion和EverNote作为个人知识管理系统 (Chinese)](https://onetwo.ren/%E7%94%A8tiddlywiki%E6%9B%BF%E4%BB%A3notion%E5%92%8Cevernote%E7%AE%A1%E7%90%86%E7%9F%A5%E8%AF%86/)

英文翻译即将问世。(?)

## 部署到Github页面

自动。

## NPM Scripts

`npm build`: 将tiddlywiki的数据打包成一个HTML文件。

## Shell Scripts

[scripts/build-wiki.js](scripts/build-wiki.js)实际上会把tiddlywiki的数据打包到一个HTML文件中。

## 灵感

脚本的灵感来自[DiamondYuan/wiki](https://github.com/DiamondYuan/wiki)