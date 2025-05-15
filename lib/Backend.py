import sys
import shutil
from yt_dlp import YoutubeDL

def check_yt_dlp_installed():
    try:
        import yt_dlp
    except ImportError:
        print("yt-dlp Python module not installed. Installing now...")
        subprocess.run([sys.executable, "-m", "pip", "install", "yt-dlp"], check=True)
        print("yt-dlp installed successfully.\n")

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

def get_audio_format_ids(info):
    formats = []
    for fmt in info.get("formats", []):
        if fmt.get("vcodec") == "none" and fmt.get("acodec") != "none":
            size_bytes = fmt.get("filesize_approx") or fmt.get("filesize")
            size_str = f"{round(size_bytes / (1024 * 1024), 1)}MB" if size_bytes else "Unknown size"
            formats.append((fmt["format_id"], fmt["ext"], size_str))
    return formats

def download_video(url, resolution):
    ydl_opts = {
        'format': f'bestvideo[height<={resolution}]+bestaudio/best',
        'merge_output_format': 'mp4'
    }
    print(f"\nDownloading video at {resolution}p...\n")
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

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

def main():
    check_yt_dlp_installed()
    url = input("Enter the YouTube URL: ").strip()

    with YoutubeDL({'quiet': True}) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except Exception as e:
            print(f"Failed to fetch video info: {e}")
            return

    print("\nChoose media type:\n  1. Video\n  2. Audio")
    media_type = input("Enter 1 or 2: ").strip()

    if media_type == "1":
        res_list = get_video_resolutions(info)
        if not res_list:
            print("No video resolutions found.")
        else:
            print("\nAvailable Video Resolutions:")
            for res, size in res_list.items():
                print(f"{res}p ({size})")
            selected_res = input("\nEnter desired resolution (e.g. 720): ").strip()
            if selected_res not in res_list:
                print("Invalid resolution selected.")
                return
            download_video(url, selected_res)

    elif media_type == "2":
        audio_formats = get_audio_format_ids(info)
        if not audio_formats:
            print("No audio formats found.")
        else:
            print("\nAvailable Audio Formats:")
            for fmt in audio_formats:
                print(f"{fmt[0]}: {fmt[1]} ({fmt[2]})")
            selected_id = input("\nEnter format ID to download: ").strip()
            format_ids = [fmt[0] for fmt in audio_formats]
            if selected_id not in format_ids:
                print("Invalid format ID selected.")
                return
            download_audio(url, selected_id)
    else:
        print("Invalid choice. Please enter 1 for Video or 2 for Audio.")

if __name__ == "__main__":
    main()
