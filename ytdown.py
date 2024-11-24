from pytube import YouTube
url="https://youtu.be/NdiWaePlo08?si=q10qncZ9MZotRGfT"
video=YouTube(url)
for stream in video.streams:
     
     if "video" in str(stream) and "mp4" in str(stream):
        print(stream)
stream1=video.streams.get_by_itag(394)
print("Downloading")
print(stream1.download(filename="Tamil hollywood"))
print("Downloaded successfully")