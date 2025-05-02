# Bilibili Web 音频模式（Chrome 扩展）

> 基于 [Ashish-Bansal/audio-only-youtube: Listen to only audio on youtube.](https://github.com/Ashish-Bansal/audio-only-youtube)

安装: [Audio Only bilibili - Chrome 网上应用店](https://chrome.google.com/webstore/detail/audio-only-bilibili/ckdhkbociihkjomnnmobadacinmehjfc?hl=zh-CN)

=======================================

好处：
- 节省带宽（视频数据部分）
- 节省视频解码、渲染的系统资源开销

使用：
- 点击扩展图标切换模式

效果:

如果插件运行成功，在视频会静止，弹幕正常运动，声音正常运行。

## 手动安装

1. 下载：[Releases · cyio/audio-only-bilibili](https://github.com/cyio/audio-only-bilibili/releases)
2. 打开：`chrome://extensions`，将下载包拖入安装

## 贡献

1. After cloning the repo,  run `npm run dev`.
2. Open chrome, go to extensions tab, load unpacked extension and select
   `build/dev` directory.
3. Go to bilibili and see extension in live.

In case you edit code, it would automatically rebuild the extension and after
that you need to reload it in the browser.

## 原理

一般主流视频网站都支持视频、音频流分离，扩展获取到音频流地址，设置给`<video>`

技术点：
- 是否屏蔽视频数据流
   - 屏蔽，网站会产生不断重试请求，显著消耗资源
      - 实现需要 api：`declarativeNetRequest`
   - 不屏蔽，只请求开头一小段视频数据，后续只请求音频数据
      - 过滤出音频数据：`webRequest.onBeforeRequest`
