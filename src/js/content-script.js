let originalStyle = null;

async function applyThumbnailStyle(element) {
  if (!originalStyle) {
    originalStyle = {
      background: element.style.background,
      backgroundSize: element.style.backgroundSize
    };
  }

  const thumbnailUrl = function getThumbnailUrl(property, value) {
    const metas = document.getElementsByTagName("meta");
    for (let i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute(property) === value) {
        return metas[i].getAttribute("content");
      }
    }
    return "";
  }("itemprop", "image");

  element.style.background = `transparent url(${thumbnailUrl}) no-repeat center / cover`;
  element.style.opacity = "0.3";
}

function restoreOriginalStyle(element) {
  function restoreBackground(element) {
    if (originalStyle) {
      element.style.background = originalStyle.background;
    }
  }

  function removeAudioOnlyDivs() {
    const audioOnlyDivs = document.getElementsByClassName("audio_only_div");
    if (audioOnlyDivs.length) {
      Array.from(audioOnlyDivs).forEach(div => div.remove());
    }
  }

  restoreBackground(element);
  removeAudioOnlyDivs();
}

function createAudioOnlyUI(element) {
  chrome.storage.sync.get({ showThumbnail: true }, result => {
    if (result.showThumbnail) {
      applyThumbnailStyle(element);
    }
  });

  function createAlertDiv(element) {
    const existingDiv = document.querySelector(".audio_only_div");
    if (existingDiv && existingDiv.parentNode) {
      existingDiv.parentNode.removeChild(existingDiv);
    }

    const div = document.createElement("div");
    div.className = "audio_only_div";

    const p = document.createElement("p");
    p.className = "alert_text";
    p.innerHTML = '音频模式<br><div class="small">点击扩展图标切换模式</div>';
    div.appendChild(p);

    const parent = element.parentNode;
    if (!parent) return;

    const grandParent = parent.parentNode;
    if (grandParent) {
      grandParent.appendChild(div);
      setTimeout(() => {
        const alertText = document.querySelector(".alert_text");
        if (alertText) {
          alertText.addEventListener("click", () => {
            chrome.runtime.sendMessage({ type: "disable-extension" });
          }, true);
        }
      }, 0);
    }
  }

  createAlertDiv(element);
}

function handleVideoElement(url) {
  const video = window.document.getElementsByTagName("video")[0];
  if (video === undefined) {
    console.log("Audio Only bilibili - Video element undefined in this frame!");
    return;
  }

  const rect = video.getBoundingClientRect();
  if (rect.width !== 0 || rect.height !== 0) {
    video.onloadeddata = function(e, t) {
      return function() {
        if (t !== "" && e.src !== t) {
          e.pause();
          e.src = t;
          e.currentTime = 0;
          e.play();
          console.log("完成替换");
        }
      };
    }(video, url);

    url ? createAudioOnlyUI(video) : restoreOriginalStyle(video);
  } else {
    console.log("Audio Only bilibili - Video element not visible!");
  }
}

chrome.runtime.onMessage.addListener(message => {
  handleVideoElement(message.url);
}); 