const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const youtubedl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
// const { v4: uuidv4 } = require("uuid"); // no longer used



const app = express();
const PORT = 5000;

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });

// Simple logger to write to both console and file
const logger = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(`[${new Date().toLocaleTimeString()}] ${msg}\n`);
  accessLogStream.write(logMsg);
};

app.use(cors());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev")); // keep console logs too for development
app.use(express.json());



// In-memory cache
const CACHE = {};

app.get("/", (req, res) => {
  res.json({ message: "YouTube Downloader API (Node.js) is running." });
});

app.post("/formats", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  if (CACHE[url]) return res.json(CACHE[url]);

  try {
    logger(`Fetching info for: ${url}`);
    const info = await youtubedl(url, {

      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    // Use maps to find the best format of each type/resolution
    const bestVideo = new Map(); // height -> bestFormat
    const bestAudio = new Map(); // extension -> bestFormat

    // Find the best audio format first to estimate total size
    let matchedAudio = info.formats
      .filter(f => f.vcodec === 'none' && f.acodec !== 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
    const audioSize = matchedAudio ? (matchedAudio.filesize || matchedAudio.filesize_approx || 0) : 0;

    info.formats.forEach((f) => {
      const isVideo = f.vcodec !== "none";
      const isAudioOnly = f.vcodec === "none";

      if (isAudioOnly) {
        const ext = f.ext || "audio";
        if (!bestAudio.has(ext) || (f.abr || 0) > (bestAudio.get(ext).abr || 0)) {
          bestAudio.set(ext, {
            format_id: f.format_id,
            ext: f.ext,
            abr: f.abr ? Math.round(f.abr) : "?",
            size: f.filesize ? (f.filesize / (1024 * 1024)).toFixed(2) + " MB" : "Unknown",
          });
        }
      } else if (isVideo) {
        const h = f.height || 0;
        if (h === 0) return;
        
        // Prioritize MP4 and higher bitrate
        const current = bestVideo.get(h);
        const isBetter = !current || 
                        (f.ext === "mp4" && current.ext !== "mp4") ||
                        (f.ext === current.ext && (f.tbr || 0) > (current.tbr || 0));

        if (isBetter) {
          const rawSize = f.filesize || f.filesize_approx || 0;
          // Add audio size to the estimate if format is video-only
          const totalSize = (f.acodec === "none" ? rawSize + audioSize : rawSize);
          
          bestVideo.set(h, {
            format_id: f.format_id,
            height: h,
            ext: f.ext,
            size: totalSize ? (totalSize / (1024 * 1024)).toFixed(2) + " MB" : "Unknown",
            raw_size: totalSize,
            tbr: f.tbr || 0
          });
        }
      }
    });

    const video = Array.from(bestVideo.values()).sort((a, b) => b.height - a.height);
    const audio = Array.from(bestAudio.values()).sort((a, b) => b.abr - a.abr);


    const result = {
      video,
      audio,
      title: info.title
    };

    CACHE[url] = result;
    res.json(result);
  } catch (err) {
    logger(`Info error: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch video info" });
  }

});

app.get("/download", async (req, res) => {
  const { url, type, format_id, title, size } = req.query;
  if (!url || !format_id) return res.status(400).send("Missing parameters");

  const safeTitle = (title || "video").replace(/[\\\/:*?"<>|]/g, "");
  const finalExt = type === "audio" ? "mp3" : "mp4";
  const filename = `${safeTitle}.${finalExt}`;

  // SMART LOGIC (guess based on type if missing)
  let formatOption = format_id;
  if (type === "video" && !format_id.includes("+")) {
    formatOption = `${format_id}+bestaudio`;
  }

  logger(`INSTANT stream starting for: ${filename} (Size: ${size || 'unknown'})`);


  // Set headers immediately 
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.setHeader("Content-Type", type === "audio" ? "audio/mpeg" : "video/mp4");
  if (size && parseInt(size) > 0) {
    res.setHeader("Content-Length", size);
  }



  try {
    // IMPORTANT: use exec to get the child process and pipe stdout to the response.
    // -o - tells yt-dlp to stream the output to stdout.
    const flags = {
      format: formatOption,
      output: "-",
      mergeOutputFormat: type === "video" ? "mp4" : undefined,
      noWarnings: true,
    };

    // We use the raw child process via youtube-dl-exec's create method
    const ytProcess = youtubedl.exec(url, flags);

    ytProcess.stdout.pipe(res);
    
    // Add error handlers to prevent process crashes
    ytProcess.on("error", (err) => {
      logger(`CRITICAL: ytProcess failed to start: ${err.message}`);
    });

    ytProcess.stdout.on("error", (err) => {
      logger(`CRITICAL: ytProcess pipe broke: ${err.message}`);
    });


    ytProcess.stderr.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("ERROR")) console.error(`[yt-dlp] ${msg}`);
    });

    ytProcess.on("close", (code) => {
      logger(`Stream process closed with code ${code} for ${filename}`);
      res.end();
    });


    // Handle abrupt disconnection from client
    req.on("close", () => {
      ytProcess.kill();
    });

  } catch (err) {
    console.error("[server] Streaming error:", err);
    if (!res.headersSent) res.status(500).send(err.message);
  }
});


app.post("/download", async (req, res) => {

  const { url, type, format_id } = req.body;
  if (!url || !format_id) return res.status(400).json({ error: "Missing parameters" });

  try {
    console.log(`[server] Downloading ${type}: ${format_id} from ${url}`);

    // 🔥 SMART LOGIC (from user provided snippet)
    let formatOption = format_id;
    
    // We need to know if the selected format is video-only to apply smart logic
    // We can fetch info again or check if we have it in cache (better)
    // Actually, in the server context, we just use what's passed.
    // If the frontend (popup.js) passed a format_id, we check its properties.
    
    // Let's get the info first to check vcodec/acodec like the user snippet
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
    });

    const selected = info.formats.find(f => f.format_id === format_id);
    if (!selected) return res.status(400).json({ error: "Invalid format_id" });

    if (selected.vcodec !== "none" && selected.acodec === "none") {
      console.log("⚡ Video detected → adding best audio automatically...");
      formatOption = `${format_id}+bestaudio`;
    }

    // Set up temp path
    const tmpDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const filename = `${info.title.replace(/[\\\/:*?"<>|]/g, "")}_${format_id}.${type === "audio" ? "mp3" : "mp4"}`;
    const outputPath = path.join(tmpDir, filename);

    // Download logic
    const options = {
      format: formatOption,
      output: outputPath,
      mergeOutputFormat: "mp4",
      noWarnings: true,
    };

    await youtubedl(url, options);

    if (fs.existsSync(outputPath)) {
      res.download(outputPath, filename, (err) => {
        if (err) {
          console.error("[server] Send file error:", err);
        }
        // Cleanup
        setTimeout(() => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }, 10000);
      });
    } else {
      throw new Error("Download file not found after process completed");
    }

  } catch (err) {
    console.error("[server] Download error:", err);
    res.status(500).json({ error: err.message || "Download failed" });
  }
});

app.listen(PORT, () => {
  logger(`YouTube Downloader API (Node.js) — http://127.0.0.1:${PORT}`);
});

// Global error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  logger(`CRITICAL ERROR (Uncaught Exception): ${err.stack || err.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger(`CRITICAL ERROR (Unhandled Rejection) at: ${promise}, reason: ${reason}`);
});


