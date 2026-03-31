/* ============================================================
   YouTube Downloader — Background Script
   Handing: Persistent Popup Window (MV2)
   ============================================================ */

const api = typeof browser !== "undefined" ? browser : chrome;
let popupWindowId = null;

// Listen for Browser Action clicks
api.browserAction.onClicked.addListener(() => {
  if (popupWindowId !== null) {
    // Focus the existing window instead of opening a new one
    api.windows.update(popupWindowId, { focused: true }).catch(() => {
      // If error (window was closed manually), create new
      createPopupWindow();
    });
  } else {
    createPopupWindow();
  }
});

function createPopupWindow() {
  const width = 380;
  const height = 560;

  api.windows.create({
    url: api.runtime.getURL("popup/popup.html"),
    type: "popup",
    width: width,
    height: height,
    focused: true
  }, (window) => {
    popupWindowId = window.id;
  });
}

// Clean up ID when window is closed
api.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});