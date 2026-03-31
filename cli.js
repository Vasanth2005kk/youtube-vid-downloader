const youtubedl = require("youtube-dl-exec");
const readline = require("readline");

// CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter YouTube URL: ", async (url) => {
  try {
    console.log("\nFetching video info...\n");

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    console.log(`Title: ${info.title}\n`);

    console.log("Available Formats:\n");

    info.formats.forEach((format, index) => {
      const type =
        format.vcodec === "none"
          ? "AUDIO"
          : format.acodec === "none"
          ? "VIDEO"
          : "VIDEO+AUDIO";

      console.log(
        `${index} → [${type}] | ${format.format_note || "N/A"} | ${format.ext} | ${format.resolution || "audio"} | id: ${format.format_id}`
      );
    });

    rl.question("\nEnter format number: ", async (choice) => {
      const selected = info.formats[choice];

      if (!selected) {
        console.log("Invalid choice!");
        rl.close();
        return;
      }

      console.log(`\nSelected format: ${selected.format_id}\n`);

      let formatOption = selected.format_id;

      // 🔥 SMART LOGIC
      if (selected.vcodec !== "none" && selected.acodec === "none") {
        // Video only → merge audio
        console.log("⚡ Video detected → adding best audio automatically...\n");
        formatOption = `${selected.format_id}+bestaudio`;
      }

      if (selected.vcodec === "none") {
        // Audio only
        console.log("🎵 Audio detected → downloading audio only...\n");
        formatOption = selected.format_id;
      }

      // Download
      await youtubedl(url, {
        format: formatOption,
        output: "%(title)s.%(ext)s",
        mergeOutputFormat: "mp4", // for video merge
      });

      console.log("✅ Download completed!");
      rl.close();
    });

  } catch (err) {
    console.error("Error:", err);
    rl.close();
  }
});
