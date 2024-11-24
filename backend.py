from pytube import YouTube
# url=input("Enter the url of youtube video:")
url="https://youtu.be/HsHn11SeU2M?si=uR3g1mp_8z7ZOA5K"
link=YouTube(url)
print("""
      video 
       or
      audio""")
#type=input("Enter the type of media:")
type="video"

def video():

    stream=link.streams.filter(file_extension="mp4").order_by("resolution")
    quality=["240p","360p","480p","720p","1080p","1440p","2160p","4320p"]
    for a in quality:
        print(a)
    resolution=input("Enter the quality :")
    filename=link.title+" .mp4"
    if resolution=="240p":
        a=stream.get_by_resolution(240)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="360p":
        a=stream.get_by_resolution(360)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="480p":
        a=stream.get_by_resolution(480)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="720p":
        a=stream.get_by_resolution(720)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="1080p":
        a=stream.get_by_resolution(1080)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="1440p":
        a=stream.get_by_resolution(1440)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="2160p":
        a=stream.get_by_resolution(2160)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
        
    elif resolution=="4320p":
        a=stream.get_by_resolution(4320)
        if a in stream:
            print("Downloading....")
            print(a.download(filename=filename))
            print("Downloaded successfully")
        else:
            print("The given resolution doesn't exist in the video")
            
    else:
        print("The given quality doen't found in the video")
    # for a in stream:
    #     print(a)
def audio():    
    audio_stm=link.streams.filter(only_audio=True)
    for a in audio_stm:
      print(a)
    
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