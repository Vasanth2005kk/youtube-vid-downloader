document.addEventListener("DOMContentLoaded", function () {
    const musicContainer = document.querySelector(".main-music-container");
    const videoContainer = document.querySelector(".main-video-container");
    const searchInput = document.getElementById("search-url");
    const startButton = document.getElementById("start");
    const mp3FormatsDiv = document.querySelector(".mp3-formates");
    const mp4FormatsDiv = document.querySelector(".mp4-formates");

    musicContainer.style.display = "none";
    videoContainer.style.display = "none";

    function showLoading() {
        document.getElementById("loading-overlay").style.display = "flex";
    }
    
    function hideLoading() {
        document.getElementById("loading-overlay").style.display = "none";
    }
    

    function showToast(message, isSuccess = false) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("data-aos", "fade-left");
        toast.textContent = message;
        if (isSuccess) toast.classList.add("success");
        document.body.appendChild(toast);
        setTimeout(() => (toast.style.opacity = "1"), 10);
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    let cachedFormats = {
        audio: [],
        video: []
    };
    async function fetchFormats(url) {
        showLoading();
        try {
            const [audioRes, videoRes] = await Promise.all([
                fetch("http://127.0.0.1:5000/audioformats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url })
                }),
                fetch("http://127.0.0.1:5000/videoformats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url })
                })
            ]);

            if (!audioRes.ok || !videoRes.ok) throw new Error("Failed to fetch formats");

            const audioData = await audioRes.json();
            const videoData = await videoRes.json();

            cachedFormats.audio = audioData.formats || [];
            cachedFormats.video = videoData.formats || [];

            showToast("Formats loaded!", true);
        } catch (err) {
            showToast("Error fetching formats");
            console.error(err);
        } finally {
            hideLoading();
        }
    }


    function renderFormats(container, formats, type) {
        container.innerHTML = "";

        formats.forEach(fmt => {
            const item = document.createElement("div");
            item.className = "formates";

            const label = document.createElement("label");
            label.textContent = `${fmt.ext || ''} - ${fmt.abr || fmt.resolution || fmt.format_note || fmt.filesize || ''}`;
            label.title = `ID: ${fmt.format_id}`;

            const btn = document.createElement("button");
            btn.innerHTML = `<i class="fa fa-download"></i>`;
            btn.addEventListener("click", () => {
                handleDownload(type, fmt.format_id);
            });

            item.appendChild(label);
            item.appendChild(btn);
            container.appendChild(item);
        });
    }

    async function handleDownload(type, format_id) {
        const url = searchInput.value.trim();
        const endpoint = type === "audio" ? "downloadaudio" : "downloadvideo";

        showToast(`Downloading ${type.toUpperCase()}...`);

        try {
            const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, format_id })
            });

            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${type}_${format_id}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            showToast("Download started!", true);
        } catch (err) {
            showToast("Download error");
            console.error(err);
        }
    }

    startButton.addEventListener("click", async function () {
        const url = searchInput.value.trim();

        if (!url) {
            showToast("Please enter a YouTube URL");
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            showToast("Invalid YouTube link");
            return;
        }

        await fetchFormats(url);

        document.getElementById("active").style.display = "block";
        startButton.style.display = "none";
    });

    document.querySelector(".music").addEventListener("click", function () {
        document.querySelector(".home-container").style.display = "none";
        videoContainer.style.display = "none";
        musicContainer.style.display = "block";
        renderFormats(mp3FormatsDiv, cachedFormats.audio, "audio");
    });

    document.querySelector(".video").addEventListener("click", function () {
        document.querySelector(".home-container").style.display = "none";
        musicContainer.style.display = "none";
        videoContainer.style.display = "block";
        renderFormats(mp4FormatsDiv, cachedFormats.video, "video");
    });

    document.getElementById("a-return-back").addEventListener("click", function () {
        document.querySelector(".home-container").style.display = "block";
        musicContainer.style.display = "none";
    });

    document.getElementById("v-return-back").addEventListener("click", function () {
        document.querySelector(".home-container").style.display = "block";
        videoContainer.style.display = "none";
    });
});
