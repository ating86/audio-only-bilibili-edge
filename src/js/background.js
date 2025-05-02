class Background {
  constructor() {
    this.tabIds = new Map();

    chrome.storage.local.get('audio_only_bilibili_disabled', (values) => {
      let disabled = values.audio_only_bilibili_disabled;
      if (typeof disabled === 'undefined') {
        disabled = false;
        this.saveSettings(disabled);
      }

      if (disabled) {
        this.disableExtension();
      } else {
        this.enableExtension();
      }
    });

    chrome.action.onClicked.addListener(() => {
      chrome.storage.local.get('audio_only_bilibili_disabled', (values) => {
        let disabled = values.audio_only_bilibili_disabled;

        if (disabled) {
          this.enableExtension();
        } else {
          this.disableExtension();
        }

        disabled = !disabled;
        this.saveSettings(disabled);
      });

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
          url: '*://*.bilibili.com/*',
        },
        (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
          }
        }
      );
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'video-change':
          break;
        case 'disable-extension':
          this.saveSettings(true);
          this.disableExtension();
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const { id, url } = tabs[0] || {};
            if (id) chrome.tabs.update(id, {url});
          });
          break;
      }
    });
  }

  getPathname(url) {
    if (!url) return '';
    const u = new URL(url);
    return u.pathname;
  }

  processRequest(details) {
    const { url, tabId } = details;
    if (!url.includes("bilivideo.com/upgcxcode") || !url.includes("30280.m4s")) return;

    if (url && this.tabIds.get(tabId) !== url) {
      this.tabIds.set(tabId, url);
      this.sendMessage(tabId);
    }
  }

  sendMessage(tabId) {
    if (this.tabIds.has(tabId)) {
      chrome.tabs.sendMessage(tabId, {
        url: this.tabIds.get(tabId),
      });
    }
  }

  enableExtension() {
    chrome.action.setIcon({
      path: {
        19: 'img/icon38.png',
        128: 'img/icon128.png',
      },
    });
    chrome.tabs.onUpdated.addListener(this.sendMessage.bind(this));
  }

  disableExtension() {
    chrome.action.setIcon({
      path: {
        19: 'img/disabled_icon19.png',
        128: 'img/disabled_icon128.png'
      },
    });
    chrome.tabs.onUpdated.removeListener(this.sendMessage.bind(this));
    this.tabIds.clear();
  }

  saveSettings(disabled) {
    chrome.storage.local.set({ audio_only_bilibili_disabled: disabled });
  }
}

const background = new Background();
