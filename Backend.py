from moviepy import VideoFileClip,AudioFileClip
import os
from pytube import YouTube
url=input("Enter the url of youtube video:")
# url="https://youtube.com/shorts/yIQjlWQ2Zlc?si=Er3JuN4AtipNyp-r"
link=YouTube(url)
print("""
      video 
       or
      audio""")
type=input("Enter the type of media:")
# type="video"
audiofile_name="audio.mp3"
filename="video.mp4"
def audio_file():
    audio_stm=link.streams.filter(only_audio=True)
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
def video():
    stream=link.streams.filter(progressive=False,file_extension="mp4").order_by("resolution")
    for v in stream:
        print(v)
    quality=["144p","240p","360p","480p","720p","1080p","1440p","2160p","4320p"]
    for a in quality:
        print(a)
    resolution=input("Enter the quality :")
    if resolution=="144p":
        a=stream.filter(res="144p").first()
        if  "res=" in str(stream) and "144p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
    elif resolution=="240p":
        a=stream.filter(res="240p").first()
        if  "res=" in str(stream) and "240p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="360p":
        a=stream.filter(res="360p").first()
        if  "res=" in str(stream) and "360p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="480p":
        a=stream.filter(res="480p").first()
        if  "res=" in str(stream) and "480p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="720p":
        a=stream.filter(res="720p").first()
        if  "res=" in str(stream) and "720p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="1080p":
        a=stream.filter(res="1080p").first()
        if  "res=" in str(stream) and "1080p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="1440p":
        a=stream.filter(res="1440p").first()
        if  "res=" in str(stream) and "1440p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="2160p":
        a=stream.filter(res="2160p").first()
        if  "res=" in str(stream) and "2160p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="4320p":
        a=stream.filter(res="4320p").first()
        if  "res=" in str(stream) and "4320p" in str(stream):
            audio_file()
            print(a.download(filename=filename))
            connector()
        else:
            print("The given resolution doesn't exist in the video")
            
    else:
        print("The given quality doen't found in the video")

def audio():    
    audio_stm=link.streams.filter(only_audio=True)
    b=audio_stm.first()
    print("downloading...")
    file_name=link.title+" .mp3"
    print(b.download(filename=file_name))
    print("done")
    
if type=="video":
    video()
elif type=="audio":
    audio()
else:
    print("Enter the valid type of media you want to download ")
if type=="video":
    os.remove("audio.mp3")
    os.remove("video.mp4")
