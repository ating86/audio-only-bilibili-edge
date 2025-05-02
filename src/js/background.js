class AudioOnlyBilibiliExtension {
  constructor() {
    this.tabIds = new Map();

    // 检查网络请求是否符合目标音频链接
    this.processRequest = (details) => {
      const { url, tabId } = details;
      if (!url.includes("bilivideo.com/upgcxcode") || !url.includes("30280.m4s")) return;

      if (url && this.tabIds.get(tabId) !== url) {
        this.tabIds.set(tabId, url);
        this.sendMessage(tabId);
      }
    };

    // 向 content-script 发送消息
    this.sendMessage = (tabId) => {
      if (this.tabIds.has(tabId)) {
        chrome.tabs.sendMessage(tabId, {
          url: this.tabIds.get(tabId)
        });
      }
    };

    // 启用扩展功能
    this.enableExtension = () => {
      chrome.browserAction.setIcon({ path: { 128: "img/icon128.png" } });
      chrome.tabs.onUpdated.addListener(this.sendMessage);
      chrome.webRequest.onBeforeRequest.addListener(this.processRequest, {
        urls: ["<all_urls>"]
      });
    };

    // 禁用扩展功能
    this.disableExtension = () => {
      chrome.browserAction.setIcon({ path: { 128: "img/disabled_icon128.png" } });
      chrome.tabs.onUpdated.removeListener(this.sendMessage);
      chrome.webRequest.onBeforeRequest.removeListener(this.processRequest);
      this.tabIds.clear();
    };

    // 保存启用/禁用状态
    this.saveSettings = (disabled) => {
      chrome.storage.local.set({ audio_only_bilibili_disabled: disabled });
    };

    // 初始化设置
    chrome.storage.local.get("audio_only_bilibili_disabled", (result) => {
      let disabled = result.audio_only_bilibili_disabled;
      if (disabled === undefined) {
        disabled = false;
        this.saveSettings(disabled);
      }

      if (disabled) {
        this.disableExtension();
      } else {
        this.enableExtension();
      }
    });

    // 点击扩展图标时切换启用状态
    chrome.browserAction.onClicked.addListener(() => {
      chrome.storage.local.get("audio_only_bilibili_disabled", (result) => {
        let disabled = result.audio_only_bilibili_disabled;
        if (disabled) {
          this.enableExtension();
        } else {
          this.disableExtension();
        }
        this.saveSettings(!disabled);
      });

      // 重新加载当前 Bilibili 标签页
      chrome.tabs.query({ active: true, currentWindow: true, url: "*://*.bilibili.com/*" }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
        }
      });
    });

    // 监听外部消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case "video-change":
          // 这里可以扩展处理视频切换的逻辑
          break;
        case "disable-extension":
          this.saveSettings(true);
          this.disableExtension();

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const { id, url } = tabs[0] || {};
            if (id) chrome.tabs.update(id, { url });
          });
          break;
      }
    });
  }
}

// 初始化扩展
new AudioOnlyBilibiliExtension();
