class BackgroundManager {
  constructor() {
    this.tabIds = new Map();
    
    this.processRequest = (request) => {
      const { url, tabId } = request;
      if (!url.includes("bilivideo.com/upgcxcode") || !url.includes("30280.m4s")) {
        return;
      }
      const videoUrl = url;
      if (videoUrl && this.tabIds.get(tabId) !== videoUrl) {
        this.tabIds.set(tabId, videoUrl);
        this.sendMessage(tabId);
      }
    };

    this.sendMessage = (tabId) => {
      if (this.tabIds.has(tabId)) {
        chrome.tabs.sendMessage(tabId, { url: this.tabIds.get(tabId) });
      }
    };

    this.enableExtension = () => {
      chrome.browserAction.setIcon({ path: { 128: "img/icon128.png" } });
      chrome.tabs.onUpdated.addListener(this.sendMessage);
      chrome.webRequest.onBeforeRequest.addListener(
        this.processRequest,
        { urls: ["<all_urls>"] }
      );
    };

    this.disableExtension = () => {
      chrome.browserAction.setIcon({ path: { 128: "img/disabled_icon128.png" } });
      chrome.tabs.onUpdated.removeListener(this.sendMessage);
      chrome.webRequest.onBeforeRequest.removeListener(this.processRequest);
      this.tabIds.clear();
    };

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
      disabled ? this.disableExtension() : this.enableExtension();
    });

    // 监听扩展图标点击事件
    chrome.browserAction.onClicked.addListener(() => {
      chrome.storage.local.get("audio_only_bilibili_disabled", (result) => {
        let disabled = result.audio_only_bilibili_disabled;
        disabled ? this.enableExtension() : this.disableExtension();
        disabled = !disabled;
        this.saveSettings(disabled);
      });
      
      // 刷新当前标签页
      chrome.tabs.query(
        { active: true, currentWindow: true, url: "*://*.bilibili.com/*" },
        (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
          }
        }
      );
    });

    // 监听消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case "video-change":
          break;
        case "disable-extension":
          this.saveSettings(true);
          this.disableExtension();
          chrome.tabs.query(
            { active: true, currentWindow: true },
            (tabs) => {
              const { id, url } = tabs[0] || {};
              if (id) {
                chrome.tabs.update(id, { url });
              }
            }
          );
          break;
      }
    });
  }
}

new BackgroundManager(); 