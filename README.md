# 🚀 YouTube Video Downloader

A powerful and easy-to-use YouTube video and audio downloader built with Node.js and a browser extension. This persistent, fast tool auto-detects YouTube URLs, fetches all available formats, and streams high-quality media directly to your local machine.


## ✨ Key Features

- **🎯 Persistent Window:** Stays open while you browse—it only closes when you want it to.
- **⚡ Instant Start:** Downloads begin in less than 1 second for a smooth experience.
- **💎 Best Quality:** Automatically joins the best video and audio together for you.
- **📏 Progress Tracking:** See exactly how much time is left with accurate progress bars.
- **🖥️ Two Ways to Use:** Fast browser extension or a simple terminal CLI tool.
- **📁 Log Management:** Automatically saves your download history to a `server.log` file.


## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Morgan (logging), `youtube-dl-exec`.
- **Frontend:** HTML5, CSS, Javascript (Extension API).
- **Core Engine:** `yt-dlp` & `ffmpeg`.

## 🚀 Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [FFmpeg](https://ffmpeg.org/) installed on your system.

### 2. Setup
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Run the Backend
The extension communicates with a local server on port 5000.
```bash
npm start
```

### 4. Load the Extension
1. Open your browser's extension management page (`chrome://extensions` or `about:debugging`).
2. Enable "Developer mode".
3. Click "Load unpacked" and select the project directory.

## 💻 CLI Usage
You can also download videos directly from your terminal:
```bash
npm run cli
```

## 📝 Configuration & Logs
- **Logs:** All server activity, including errors and download hits, is saved to `server.log` in the root directory.
- **Temp Files:** Local temporary files are automatically cleaned up after successful streaming.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Vasanth2005kk/youtube-vid-downloader/issues).

---
**Maintained by [Vasanth2005kk](https://github.com/Vasanth2005kk)**
