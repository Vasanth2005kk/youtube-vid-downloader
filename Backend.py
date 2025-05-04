import subprocess
import re

try:
    subprocess.run(['yt-dlp','--version'])
except Exception:
    subprocess.run(['sudo','apt','install','yt-dlp'])
def get_video_resolutions(url):
    result = subprocess.run(["yt-dlp", "-F", url], capture_output=True, text=True)
    lines = result.stdout.splitlines()

    resolutions = set()
    for line in lines:
        if "video only" in line:
            match = re.search(r'(\d{3,4})p', line)
            if match:
                resolutions.add(match.group(1))
    return sorted(resolutions, key=int)

def get_audio_bitrates(url):
    result = subprocess.run(["yt-dlp", "-F", url], capture_output=True, text=True)
    lines = result.stdout.splitlines()

    bitrates = set()
    for line in lines:
        if "audio only" in line:
            match = re.search(r'\b(\d{2,4})k\b', line)
            if match:
                bitrates.add(match.group(1))
    return sorted(bitrates, key=int)

def download_video(url, resolution):
    format_selector = f"bestvideo[height<={resolution}]+bestaudio"
    print(f"\nDownloading video at {resolution}p...\n")
    subprocess.run(["yt-dlp", "-f", format_selector, url])

def download_audio(url, bitrate):
    # Automatically choose best audio ≤ given bitrate
    format_selector = f"bestaudio[abr<={bitrate}]"
    print(f"\nDownloading audio at ≤{bitrate}k...\n")
    subprocess.run([
        "yt-dlp",
        "-f", format_selector,
        "--extract-audio",
        "--audio-format", "mp3",
        url
    ])

url = input("Enter the YouTube URL: ")

print("""
      video 
       or
      audio""")
media_type = input("Enter the media type :").strip().lower()

if media_type == "video":
    res_list = get_video_resolutions(url)
    if not res_list:
        print("No video resolutions found.")
    else:
        print("\nAvailable Video Resolutions:")
        for res in res_list:
            print(f"{res}p")
        selected_res = input("\nEnter resolution : ").strip()
        download_video(url, selected_res)

elif media_type == "audio":
    bitrate_list = get_audio_bitrates(url)
    if not bitrate_list:
        print("No audio formats found.")
    else:
        print("\nAvailable Audio Bitrates:")
        for br in bitrate_list:
            print(f"{br}k")
        selected_br = input("\nEnter desired Quality : ").strip()
        download_audio(url, selected_br)

else:
    print("Invalid media type. Please choose the Correct formate.")
