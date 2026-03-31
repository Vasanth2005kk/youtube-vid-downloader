/**
 * YouTube Downloader — Popup Script
 * Firefox-first (MV2), Chrome compatible.
 *
 * Flow:
 *  1. On open → auto-detect active YouTube tab URL → auto-fetch formats
 *  2. User can also paste URL manually and click "Get Formats"
 *  3. Video / Audio tabs show all available formats
 *  4. Download button → POST /download → Flask streams file → browser saves it
 */

// Firefox uses `browser.*`, Chrome uses `chrome.*`
const api = typeof browser !== "undefined" ? browser : chrome;

const SERVER = "http://127.0.0.1:5000";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const urlInput       = document.getElementById("url-input");
const btnDetect      = document.getElementById("btn-detect");
const btnFetch       = document.getElementById("btn-fetch");
const loadingEl      = document.getElementById("loading");
const formatsPanel   = document.getElementById("formats-panel");
const statusMsg      = document.getElementById("status-msg");
const downloadBar    = document.getElementById("download-bar");
const downloadLabel  = document.getElementById("download-label");
const toastEl        = document.getElementById("toast");
const tabBtns        = document.querySelectorAll(".tab-btn");
const contentVideo   = document.getElementById("content-video");
const contentAudio   = document.getElementById("content-audio");
const videoList      = document.getElementById("video-formats-list");
const audioList      = document.getElementById("audio-formats-list");
const btnClose       = document.getElementById("btn-close-popup");


// ── State ─────────────────────────────────────────────────────────────────────
let cachedVideo = [];  // [{height, format_id, size}]
let cachedAudio = [];  // [{format_id, ext, abr, size}]
let cachedTitle = "video";


// ── Helpers ───────────────────────────────────────────────────────────────────
function isYouTubeURL(url) {
  return url && (url.includes("youtube.com/watch") || url.includes("youtu.be/"));
}

function showLoading(show) {
  loadingEl.classList.toggle("hidden", !show);
  btnFetch.disabled = show;
}

function showStatus(msg, type = "") {
  statusMsg.textContent = msg;
  statusMsg.className = "status-msg" + (type ? " " + type : "");
  statusMsg.classList.remove("hidden");
}

function hideStatus() {
  statusMsg.classList.add("hidden");
}

let toastTimer = null;
function showToast(msg, type = "") {
  toastEl.textContent = msg;
  toastEl.className = "toast" + (type ? " " + type : "");
  // Force reflow so transition fires
  void toastEl.offsetWidth;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3000);
}

// ── Tab detection ─────────────────────────────────────────────────────────────
async function detectYouTubeTab() {
  try {
    const tabs = await api.tabs.query({ active: true, lastFocusedWindow: true });

    const tab = tabs[0];
    if (tab && isYouTubeURL(tab.url)) {
      return tab.url;
    }
  } catch (e) {
    console.error("Tab query failed:", e);
  }
  return null;
}

// ── Format fetching ───────────────────────────────────────────────────────────
async function fetchFormats(url) {
  showLoading(true);
  hideStatus();
  formatsPanel.classList.add("hidden");
  downloadBar.classList.add("hidden");

  try {
    const res = await fetch(`${SERVER}/formats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Server error" }));
      throw new Error(err.error || "Failed to fetch formats");
    }

    const data = await res.json();

    // Data structure from unified endpoint: { video: [...], audio: [...], title: "..." }
    cachedVideo = data.video || [];
    cachedAudio = data.audio || [];
    cachedTitle = data.title || "video";


    if (cachedVideo.length === 0 && cachedAudio.length === 0) {
      showStatus("No formats found for this video.", "error");
      return;
    }

    renderVideoFormats();
    renderAudioFormats();
    formatsPanel.classList.remove("hidden");
    
    const titleSnippet = data.title ? ` fetched: ${data.title.substring(0, 30)}...` : "";
    showToast("Formats loaded!" + titleSnippet, "success");

  } catch (err) {
    console.error(err);
    showStatus(err.message, "error");
  } finally {
    showLoading(false);
  }
}

// ── Render formats ────────────────────────────────────────────────────────────
function renderVideoFormats() {
  videoList.innerHTML = "";

  if (!cachedVideo.length) {
    videoList.innerHTML = `<p style="color:var(--text-muted);font-size:12px;padding:12px;text-align:center">No video formats available</p>`;
    return;
  }

  // Sort highest resolution first
  const sorted = [...cachedVideo].sort((a, b) => (b.height || 0) - (a.height || 0));

  sorted.forEach(fmt => {
    const row = document.createElement("div");
    row.className = "format-row";

    const info = document.createElement("div");
    info.className = "format-info";

    const label = document.createElement("div");
    label.className = "format-label";
    label.innerHTML = `<span class="badge video">${fmt.height ? fmt.height + "p" : "?"}</span> ${fmt.ext || "mp4"}`;

    const meta = document.createElement("div");
    meta.className = "format-meta";
    meta.textContent = fmt.size ? `Size: ${fmt.size}` : "Size: Unknown";

    const btn = document.createElement("button");
    btn.className = "btn-download";
    btn.innerHTML = `<i class="fas fa-download"></i> Save`;
    btn.addEventListener("click", () => triggerDownload("video", fmt.format_id, fmt.height));

    info.appendChild(label);
    info.appendChild(meta);
    row.appendChild(info);
    row.appendChild(btn);
    videoList.appendChild(row);
  });
}

function renderAudioFormats() {
  audioList.innerHTML = "";

  if (!cachedAudio.length) {
    audioList.innerHTML = `<p style="color:var(--text-muted);font-size:12px;padding:12px;text-align:center">No audio formats available</p>`;
    return;
  }

  // Sort by bitrate desc
  const sorted = [...cachedAudio].sort((a, b) => (parseFloat(b.abr) || 0) - (parseFloat(a.abr) || 0));

  sorted.forEach(fmt => {
    const row = document.createElement("div");
    row.className = "format-row";

    const info = document.createElement("div");
    info.className = "format-info";

    const label = document.createElement("div");
    label.className = "format-label";
    label.innerHTML = `<span class="badge audio">${(fmt.ext || "audio").toUpperCase()}</span> ${fmt.abr ? fmt.abr + " kbps" : "Audio"}`;

    const meta = document.createElement("div");
    meta.className = "format-meta";
    meta.textContent = fmt.size ? `Size: ${fmt.size}` : "Size: Unknown";

    const btn = document.createElement("button");
    btn.className = "btn-download";
    btn.innerHTML = `<i class="fas fa-download"></i> Save`;
    btn.addEventListener("click", () => triggerDownload("audio", fmt.format_id));

    info.appendChild(label);
    info.appendChild(meta);
    row.appendChild(info);
    row.appendChild(btn);
    audioList.appendChild(row);
  });
}

// ── Download ──────────────────────────────────────────────────────────────────
async function triggerDownload(type, formatId, height) {
  const url = urlInput.value.trim();
  if (!url) { showToast("No URL set", "error"); return; }

  // Disable all download buttons to prevent double-click
  document.querySelectorAll(".btn-download").forEach(b => b.disabled = true);

  downloadBar.classList.remove("hidden");
  downloadLabel.textContent = `Downloading ${type === "video" ? height + "p video" : "audio"}…`;

  try {
    const body = { url, type };
    if (type === "video") body.format_id = formatId;
    else body.format_id = formatId;

    // Find the raw size for the selected format to pass to server (for Content-Length)
    const selectedFmt = cachedVideo.concat(cachedAudio).find(f => f.format_id === formatId);
    const rawSize = selectedFmt ? (selectedFmt.raw_size || 0) : 0;
    
    const downloadUrl = `${SERVER}/download?url=${encodeURIComponent(url)}&type=${type}&format_id=${encodeURIComponent(formatId)}&title=${encodeURIComponent(cachedTitle)}&size=${rawSize}`;



    
    // Use the official downloads API if available (MV2/MV3)
    // This allows the browser to handle the download independently of the popup's lifecycle
    if (api.downloads && api.downloads.download) {
      await api.downloads.download({
        url: downloadUrl,
        filename: `${type}_${formatId}.${type === "audio" ? "mp3" : "mp4"}`,
        saveAs: true
      });
      showToast("Download started!", "success");
      downloadLabel.textContent = `Download handed off to browser manager`;
    } else {
      // Fallback for environments where downloads API isn't available
      window.open(downloadUrl, "_blank");
      showToast("Download opened in new tab", "success");
    }

  } catch (err) {
    console.error(err);
    downloadBar.classList.add("hidden");
    showToast(err.message || "Download failed", "error");
  } finally {
    document.querySelectorAll(".btn-download").forEach(b => b.disabled = false);
  }
}

// ── Event: Close ─────────────────────────────────────────────────────────────
btnClose.addEventListener("click", () => {
  window.close();
});



// ── Tabs ──────────────────────────────────────────────────────────────────────
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    contentVideo.classList.toggle("hidden", tab !== "video");
    contentAudio.classList.toggle("hidden", tab !== "audio");
  });
});

// ── Event: Auto-detect ────────────────────────────────────────────────────────
btnDetect.addEventListener("click", async () => {
  const tabUrl = await detectYouTubeTab();
  if (tabUrl) {
    urlInput.value = tabUrl;
    showToast("YouTube tab detected!", "success");
  } else {
    showToast("No active YouTube tab found", "error");
  }
});

// ── Event: Fetch formats ──────────────────────────────────────────────────────
btnFetch.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) {
    showToast("Please enter or paste a YouTube URL", "error");
    return;
  }
  if (!isYouTubeURL(url)) {
    showToast("URL must be a YouTube video link", "error");
    return;
  }
  await fetchFormats(url);
});

// ── On popup open: auto-detect and fetch ──────────────────────────────────────
(async () => {
  const tabUrl = await detectYouTubeTab();
  if (tabUrl) {
    urlInput.value = tabUrl;
    await fetchFormats(tabUrl);
  } else {
    showStatus("Open a YouTube video tab, or paste a URL above.", "");
  }
})();
