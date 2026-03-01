import io
from pathlib import Path

import requests
import yt_dlp
from PIL import Image
from mutagen.mp4 import MP4, MP4Cover


class YouTubeDownloader:
    def __init__(self, music_folder):
        self.music_folder = Path(music_folder)
        self.music_folder.mkdir(exist_ok=True)

        self.ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'noplaylist': True,
            'writethumbnail': False,
            'writeautomaticsub': False,
            'writesubtitles': False,
            'outtmpl': str(self.music_folder / '%(title)s.%(ext)s'),
            'quiet': False,
        }

    def _get_final_path(self, info):
        filename = yt_dlp.YoutubeDL({'outtmpl': self.ydl_opts['outtmpl']}).prepare_filename(info)
        return self.music_folder / Path(filename).name

    @staticmethod
    def _get_lyrics_text(info):
        lyrics_url = None
        if 'automatic_captions' in info and 'en' in info['automatic_captions']:
            for fmt in info['automatic_captions']['en']:
                if fmt.get('ext') == 'vtt':
                    lyrics_url = fmt['url']
                    break
            if not lyrics_url and info['automatic_captions']['en']:
                lyrics_url = info['automatic_captions']['en'][0]['url']
        elif 'subtitles' in info and 'en' in info['subtitles']:
            for fmt in info['subtitles']['en']:
                if fmt.get('ext') == 'vtt':
                    lyrics_url = fmt['url']
                    break
            if not lyrics_url and info['subtitles']['en']:
                lyrics_url = info['subtitles']['en'][0]['url']

        if lyrics_url:
            try:
                resp = requests.get(lyrics_url, timeout=10)
                if resp.status_code == 200:
                    lines = []
                    for line in resp.text.splitlines():
                        if '-->' not in line and line.strip() and not line.startswith(('WEBVTT', 'Kind:', 'Language:', 'NOTE')):
                            lines.append(line.strip())
                    return '\n'.join(lines)
            except:
                pass
        return None

    def _embed_all(self, m4a_path, info):
        try:
            audio = MP4(str(m4a_path))
            if not audio.tags:
                audio.add_tags()
            tags = audio.tags

            tags["\xa9nam"] = [info.get('title', 'Unknown')]
            tags["\xa9ART"] = [info.get('artist') or info.get('uploader', 'Unknown Artist')]
            tags["\xa9alb"] = [info.get('album', 'Unknown Album')]
            if 'upload_date' in info:
                tags["\xa9day"] = [info['upload_date'][:4]]

            cover_data = None
            cover_fmt = None
            if info.get('thumbnails'):
                thumb_url = info['thumbnails'][-1]['url']
                resp = requests.get(thumb_url, timeout=10)
                if resp.status_code == 200:
                    data = resp.content
                    if thumb_url.lower().endswith('.webp') or (data[:4] == b'RIFF' and b'WEBP' in data[:12]):
                        img = Image.open(io.BytesIO(data))
                        jpg_io = io.BytesIO()
                        img.convert('RGB').save(jpg_io, format='JPEG')
                        cover_data = jpg_io.getvalue()
                        cover_fmt = MP4Cover.FORMAT_JPEG
                    else:
                        cover_data = data
                        cover_fmt = MP4Cover.FORMAT_JPEG

            if cover_data:
                tags["covr"] = [MP4Cover(cover_data, imageformat=cover_fmt)]

            lyrics = self._get_lyrics_text(info)
            if lyrics:
                tags["\xa9lyr"] = [lyrics]

            audio.save()
        except Exception as e:
            print(f"Error embedding: {e}")

    def download_from_url(self, url):
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                m4a_path = self._get_final_path(info)
                self._embed_all(m4a_path, info)

                return {
                    'success': True,
                    'filename': m4a_path.name,
                    'title': info.get('title', 'Unknown'),
                    'artist': info.get('artist') or info.get('uploader', 'Unknown Artist'),
                    'album': info.get('album', 'Unknown Album'),
                    'duration': info.get('duration', 0)
                }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_available_songs(self):
        songs = []
        for ext in ['*.m4a', '*.mp3']:
            for filepath in self.music_folder.glob(ext):
                songs.append({
                    'filename': filepath.name,
                    'path': str(filepath),
                    'size': filepath.stat().st_size
                })
        return songs