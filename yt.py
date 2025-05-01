import subprocess
class youtube_downloader:
    def isaudio(url):
      #subprocess.run(["yt-dlp" ,"-F", url])
        def get_formats(url):
            result = subprocess.run(["yt-dlp", "-F", url], capture_output=True, text=True)
            formats = result.stdout.splitlines()# Filter: show only audio only formats
            for line in formats:
                if "audio only" in line:
                    print(line)
        get_formats(url)
        print("available resolutions , 128k, 160k, 192k:")
        resolution=input()
        #subprocess.run(["yt-dlp","--extract-audio-format mp3",get_format_id,url])
       

        subprocess.run([
                    "yt-dlp",
                    "--extract-audio",
                    "--audio-format", "mp3",
                    "-f", resolution,
                      url])

      #subprocess.run(["yt-dlp","-F" ,url])
    def isvideo(url):
        #subprocess.run(["yt-dlp","-F" ,url])
        # def get_formats(url):
        #     result = subprocess.run(["yt-dlp", "-F", url], capture_output=True, text=True)
        #     formats = result.stdout.splitlines()# Filter: show only mp4 formats
        #     for line in formats:
        #         if "mp4" in line:
        #             print(line)
        # get_formats(url)
        # get_format_id=input("format id:")
        print("the available resolution are 480,720,1080")
        resolution=input('enter the resolution:')
        format_selector = f"bestvideo[height={resolution}]+bestaudio/best[height<={resolution}]"
        subprocess.run(["yt-dlp", "-f", format_selector, url])
        #subprocess.run(["yt-dlp","ytsearch:{get_format_id}",url])
      
      
      
      
      
      
url=input("url:")
print("choose what yout want video or audio ")
choice=input()

obj=youtube_downloader
if choice.lower() == "audio":
    obj.isaudio(url)
elif choice.lower() == "video":
    obj.isvideo(url)
else:
    print("there is no other options")

