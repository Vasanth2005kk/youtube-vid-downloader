import sys
import subprocess
from yt_dlp import YoutubeDL

def check_yt_dlp_installed():
    try:
        import yt_dlp
    except ImportError:
        print("yt-dlp Python module not installed. Installing now...")
        subprocess.run([sys.executable, "-m", "pip", "install", "yt-dlp"], check=True)
        print("yt-dlp installed successfully.\n")

def get_video_info(url):
    ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'skip_download': True,
    'extract_flat': 'in_playlist'  # if you only want metadata
    }
    with YoutubeDL(ydl_opts) as ydl:
        try:
            return ydl.extract_info(url, download=False)
        except Exception as e:
            print(f"Error fetching info: {e}")
            return None

class Backend:

    @staticmethod
    def get_video_resolutions(info):
        resolutions = {}
        for fmt in info.get("formats", []):
            if fmt.get("vcodec") != "none" and fmt.get("acodec") == "none":
                height = fmt.get("height")
                size_bytes = fmt.get("filesize_approx") or fmt.get("filesize")
                if height:
                    if size_bytes:
                        size_mb = round(size_bytes / (1024 * 1024), 1)
                        resolutions[str(height)] = f"{size_mb}MB"
                    else:
                        resolutions[str(height)] = "Unknown size"
        return dict(sorted(resolutions.items(), key=lambda x: int(x[0])))

    @staticmethod
    def get_audio_format_ids(info):
        formats = []
        for fmt in info.get("formats", []):
            if fmt.get("vcodec") == "none" and fmt.get("acodec") != "none":
                size_bytes = fmt.get("filesize_approx") or fmt.get("filesize")
                size_str = f"{round(size_bytes / (1024 * 1024), 1)}MB" if size_bytes else "Unknown size"
                formats.append((fmt["format_id"], fmt["ext"], size_str))
        return formats

    @staticmethod
    def download_video(url, resolution):
        ydl_opts = {
            'format': f'bestvideo[height<={resolution}]+bestaudio/best',
            'merge_output_format': 'mp4',
            'outtmpl': '%(title)s.%(ext)s'
        }
        print(f"\nDownloading video at {resolution}p...\n")
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

    @staticmethod
    def download_audio(url, format_id):
        ydl_opts = {
            'format': format_id,
            'extract_audio': True,
            'audio_format': 'mp3',
            'outtmpl': '%(title)s.%(ext)s'
        }
        print(f"\nDownloading audio format {format_id}...\n")
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
