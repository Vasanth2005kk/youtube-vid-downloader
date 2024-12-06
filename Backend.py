from moviepy import VideoFileClip,AudioFileClip
import os
from pytube import YouTube

URL =input("Enter the url :")
link = YouTube(URL)

video_qualities = []
audio_qualities = []

audiofile_name="audio.mp3"
filename="video.mp4"

for i in link.streams.filter(progressive=False,file_extension="mp4").order_by("resolution"):
    if not (' progressive="True"' in str(i)):
        resolution = ((str(i)[str(i).find('res="'):])[(str(i)[str(i).find('res="'):]).find('"')+1:(str(i)[str(i).find('res="'):]).find('"',5):])

        video_qualities.append(str(resolution))


for i in link.streams.filter(only_audio=True):
    resolution = ((str(i)[str(i).find('abr="'):])[(str(i)[str(i).find('abr="'):]).find('"')+1:(str(i)[str(i).find('abr="'):]).find('"',5):])

    audio_qualities.append(str(resolution))

print("""
      video 
       or
      audio""")
Type = input("Enter the Type of media:")

def audio_file():
    audio_stm = link.streams.filter(only_audio=True)
    b=audio_stm.first()
    b.download(filename=audiofile_name)

def connector():   
    video_path =filename
    audio_path =audiofile_name
    output_path =link.title+".mp4"
    video = VideoFileClip(video_path)
    audio = AudioFileClip(audio_path)
    video_with_audio = video.with_audio(audio)
    print("Downloading...")
    video_with_audio.write_videofile(output_path,codec="libx264",audio_codec="aac")
    print("downloaded successfully")
    os.remove("audio.mp3")
    os.remove("video.mp4")

def video_downloader():
    stream=link.streams.filter(progressive=False,file_extension="mp4").order_by("resolution")
    video_resolution = input("Enter the quality:")
    if video_resolution in video_qualities:
        a=stream.filter(res=video_resolution).first()
        audio_file()
        a.download(filename=filename)
        connector()
    else:
        print("The given quality doen't found in the video")

def audio_downloader():    
    audio_stm=link.streams.filter(only_audio=True)
    b=audio_stm.first()
    print("downloading...")
    file_name=link.title+" .mp3"
    print(b.download(filename=file_name))
    print("done")
if Type.lower() == "video":
    print(video_qualities)
    video_downloader()
    
elif Type.lower() ==  "audio":
    print(audio_qualities)
    audio_downloader()
else:
    print("Please Enter The Vaild Media Type!!!")