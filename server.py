from flask import Flask, request, jsonify
from flask_cors import CORS
from yt_dlp import YoutubeDL
import lib.Backend as Backend  # Your modified yt-dlp backend logic

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Temporary hardcoded URL for demo
URL = "https://youtu.be/o9mivPpQlSA?si=zSbnGzUfdU0A8QcD"

def get_video_info(url):
    try:
        with YoutubeDL({'quiet': True}) as ydl:
            return ydl.extract_info(url, download=False)
    except Exception as e:
        print(f"Error fetching info: {e}")
        return None

@app.route('/videoformats', methods=['GET'])
def get_video_formats():
    info = get_video_info(URL)
    if not info:
        return jsonify({"error": "Failed to fetch video info"}), 500

    video_resolution = Backend.get_video_resolutions(info)
    if not video_resolution:
        return jsonify({"error": "No video resolutions found."}), 404
    return jsonify({"video_resolutions": video_resolution})

@app.route('/audioformats', methods=['GET'])
def get_audio_formats():
    info = get_video_info(URL)
    if not info:
        return jsonify({"error": "Failed to fetch video info"}), 500

    audio_formats = Backend.get_audio_format_ids(info)
    if not audio_formats:
        return jsonify({"error": "No audio formats found."}), 404
    return jsonify({"audio_formats": audio_formats})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
