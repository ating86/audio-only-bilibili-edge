// 定义类型
interface VideoElement extends HTMLVideoElement {
  style: CSSStyleDeclaration;
}

interface StorageData {
  showThumbnail: boolean;
}

interface MessageData {
  url: string;
  type?: string;
}

interface StyleData {
  background: string;
  backgroundSize: string;
}

// 主代码
let originalStyle: StyleData | null = null;

async function setThumbnailBackground(video: VideoElement): Promise<void> {
  if (!originalStyle) {
    originalStyle = {
      background: video.style.background,
      backgroundSize: video.style.backgroundSize
    };
  }

  const getMetaContent = (property: string, value: string): string => {
    const metaElements = document.getElementsByTagName("meta");
    for (let i = 0; i < metaElements.length; i++) {
      if (metaElements[i].getAttribute(property) === value) {
        return metaElements[i].getAttribute("content") || "";
      }
    }
    return "";
  };

  const imageUrl = getMetaContent("itemprop", "image");
  video.style.background = `transparent url(${imageUrl}) no-repeat center / cover`;
  video.style.opacity = "0.3";
}

function restoreOriginalStyle(video: VideoElement): void {
  if (originalStyle) {
    video.style.background = originalStyle.background;
  }
  
  const audioOnlyDivs = document.getElementsByClassName("audio_only_div");
  if (audioOnlyDivs.length) {
    Array.from(audioOnlyDivs).forEach(div => div.remove());
  }
}

function setupAudioOnlyMode(video: VideoElement): void {
  chrome.storage.sync.get({ showThumbnail: true }, (data: StorageData) => {
    if (data.showThumbnail) {
      setThumbnailBackground(video);
    }
  });

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

  const parent = video.parentNode;
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

function handleVideoElement(url: string): void {
  const video = window.document.getElementsByTagName("video")[0] as VideoElement;
  
  if (video === undefined) {
    console.log("Audio Only bilibili - Video element undefined in this frame!");
    return;
  }

  const rect = video.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    console.log("Audio Only bilibili - Video element not visible!");
    return;
  }

  video.onloadeddata = function() {
    if (url !== "" && video.src !== url) {
      video.pause();
      video.src = url;
      video.currentTime = 0;
      video.play();
      console.log("完成替换");
    }
  };

  if (url) {
    setupAudioOnlyMode(video);
  } else {
    restoreOriginalStyle(video);
  }
}

chrome.runtime.onMessage.addListener((message: MessageData) => {
  handleVideoElement(message.url);
});