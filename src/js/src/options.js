const showThumbnailCheckbox = document.getElementById("show-thumbnail");

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get({ showThumbnail: true }, result => {
    showThumbnailCheckbox.checked = result.showThumbnail;
  });
});

showThumbnailCheckbox.addEventListener("change", () => {
  chrome.storage.sync.set({ showThumbnail: showThumbnailCheckbox.checked });
}); 