from flask import Flask, request, jsonify
from flask_cors import CORS
from lib.Backend import get_video_info, Backend
import threading
from flask_compress import Compress

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
Compress(app)

@app.route('/')
def home():
    return jsonify({"message": "YouTube Downloader API is running."})

@app.route('/videoformats', methods=['POST'])
def get_video_formats():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    info = get_video_info(url)
    if not info:
        return jsonify({"error": "Failed to fetch video info"}), 500

    video_resolutions = Backend.get_video_resolutions(info)
    if not video_resolutions:
        return jsonify({"error": "No video resolutions found."}), 404

    return jsonify({"video_resolutions": video_resolutions})

@app.route('/audioformats', methods=['POST'])
def get_audio_formats():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "Missing URL"}), 400

    info = get_video_info(url)
    if not info:
        return jsonify({"error": "Failed to fetch video info"}), 500

    audio_formats = Backend.get_audio_format_ids(info)
    if not audio_formats:
        return jsonify({"error": "No audio formats found."}), 404

    return jsonify({"audio_formats": audio_formats})

@app.route('/download', methods=['POST'])
def download_media():
    data = request.get_json()
    url = data.get('url')
    media_type = data.get('type')  # 'audio' or 'video'
    format_id = data.get('format_id')
    resolution = data.get('resolution')

    if not url or not media_type:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        if media_type == "audio":
            if not format_id:
                return jsonify({"error": "Missing format ID for audio"}), 400
            threading.Thread(target=Backend.download_audio, args=(url, format_id)).start()
        elif media_type == "video":
            if not resolution:
                return jsonify({"error": "Missing resolution for video"}), 400
            threading.Thread(target=Backend.download_video, args=(url, resolution)).start()
        else:
            return jsonify({"error": "Invalid media type"}), 400

        return jsonify({"message": "Download started successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
