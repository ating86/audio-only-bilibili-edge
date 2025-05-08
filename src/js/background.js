!function(e) {
    var t = {};
    
    function s(i) {
        if (t[i]) return t[i].exports;
        var n = t[i] = {
            i: i,
            l: !1,
            exports: {}
        };
        return e[i].call(n.exports, n, n.exports, s),
        n.l = !0,
        n.exports
    }
    
    s.m = e,
    s.c = t,
    s.d = function(e, t, i) {
        s.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: i
        })
    },
    s.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    },
    s.t = function(e, t) {
        if (1 & t && (e = s(e)),
        8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var i = Object.create(null);
        if (s.r(i),
        Object.defineProperty(i, "default", {
            enumerable: !0,
            value: e
        }),
        2 & t && "string" != typeof e)
            for(var n in e)
                s.d(i, n, function(t) {
                    return e[t]
                }.bind(null, n));
        return i
    },
    s.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return s.d(t, "a", t),
        t
    },
    s.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    },
    s.p = "",
    s(s.s = 1)
}([
    ,
    function(e, t, s) {
        "use strict";
        new class {
            constructor() {
                this.tabIds = new Map,
                this.processRequest = e => {
                    const {
                        url: t,
                        tabId: s
                    } = e;
                    if (!t.includes("bilivideo.com/upgcxcode") || !t.includes("30280.m4s")) return;
                    const i = t;
                    i && this.tabIds.get(s) !== i && (this.tabIds.set(s, i),
                    this.sendMessage(s))
                },
                this.sendMessage = e => {
                    this.tabIds.has(e) && chrome.tabs.sendMessage(e, {
                        url: this.tabIds.get(e)
                    })
                },
                this.enableExtension = () => {
                    chrome.browserAction.setIcon({
                        path: {
                            128: "img/icon128.png"
                        }
                    }),
                    chrome.tabs.onUpdated.addListener(this.sendMessage),
                    chrome.webRequest.onBeforeRequest.addListener(this.processRequest, {
                        urls: ["<all_urls>"]
                    })
                },
                this.disableExtension = () => {
                    chrome.browserAction.setIcon({
                        path: {
                            128: "img/disabled_icon128.png"
                        }
                    }),
                    chrome.tabs.onUpdated.removeListener(this.sendMessage),
                    chrome.webRequest.onBeforeRequest.removeListener(this.processRequest),
                    this.tabIds.clear()
                },
                this.saveSettings = e => {
                    chrome.storage.local.set({
                        audio_only_bilibili_disabled: e
                    })
                },
                this.tabIds = new Map,
                chrome.storage.local.get("audio_only_bilibili_disabled", e => {
                    let t = e.audio_only_bilibili_disabled;
                    void 0 === t && (t = !1,
                    this.saveSettings(t)),
                    t ? this.disableExtension() : this.enableExtension()
                }),
                chrome.browserAction.onClicked.addListener(() => {
                    chrome.storage.local.get("audio_only_bilibili_disabled", e => {
                        let t = e.audio_only_bilibili_disabled;
                        t ? this.enableExtension() : this.disableExtension(),
                        t = !t,
                        this.saveSettings(t)
                    }),
                    chrome.tabs.query({
                        active: !0,
                        currentWindow: !0,
                        url: "*://*.bilibili.com/*"
                    }, e => {
                        e.length > 0 && chrome.tabs.update(e[0].id, {
                            url: e[0].url
                        })
                    })
                }),
                chrome.runtime.onMessage.addListener((e, t, s) => {
                    switch(e.type) {
                        case "video-change":
                            break;
                        case "disable-extension":
                            this.saveSettings(!0),
                            this.disableExtension(),
                            chrome.tabs.query({
                                active: !0,
                                currentWindow: !0
                            }, (function(e) {
                                const {
                                    id: t,
                                    url: s
                                } = e[0] || {};
                                t && chrome.tabs.update(t, {
                                    url: s
                                })
                            }))
                    }
                })
            }
        }
    }
]);