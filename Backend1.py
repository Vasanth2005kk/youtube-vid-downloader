import subprocess
from moviepy import VideoFileClip,AudioFileClip

url=input("Enter the url :")

video_qualities = []
audio_qualities = []

print("""
      video 
       or
      audio""")
Type = input("Enter the Type of media:")
if Type=="video":
    cmd = [f'yt-dlp -f "bestvideo[height<=720]+bestaudio/best[height<=720]" {url}']
    subprocess.run(cmd)