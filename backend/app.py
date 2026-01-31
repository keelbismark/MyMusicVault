import os

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
CORS(app)

MUSIC_FOLDER = os.path.join(os.path.dirname(__file__), '../music')

try:
    from json_handler import JSONHandler
    from youtube_downloader import YouTubeDownloader
except ImportError:
    import sys

    sys.path.insert(0, os.path.dirname(__file__))
    from json_handler import JSONHandler
    from youtube_downloader import YouTubeDownloader


class MusicPlayer:
    def __init__(self, music_folder):
        self.music_folder = music_folder
        self.current_song = None
        self.playlist = []
        self.data = JSONHandler.load_data()
        self.config = JSONHandler.load_config()
        self.favorites = set(self.data.get('favorites', []))
        self.youtube_downloader = YouTubeDownloader(music_folder)

    def save_data(self):
        self.data['favorites'] = list(self.favorites)
        JSONHandler.save_data(self.data)

    def save_config(self):
        JSONHandler.save_config(self.config)

    def load_local_songs(self):
        if not os.path.exists(self.music_folder):
            os.makedirs(self.music_folder)

        self.playlist = []
        songs = self.youtube_downloader.get_available_songs()

        for song in songs:
            filepath = song['path']
            filename = song['filename']

            try:
                from player import AudioMetadata
                metadata = AudioMetadata.get_metadata(filepath)

                if metadata:
                    title = metadata.get('title', os.path.splitext(filename)[0])
                    artist = metadata.get('artist', 'Неизвестный артист')
                    album = metadata.get('album', 'Без альбома')
                    duration = metadata.get('duration', 0)
                    cover_data = metadata.get('cover_data', None)
                else:
                    title = os.path.splitext(filename)[0]
                    artist = 'Неизвестный артист'
                    album = 'Без альбома'
                    duration = 0
                    cover_data = None

                song_info = {
                    'id': len(self.playlist),
                    'title': title,
                    'artist': artist,
                    'album': album,
                    'filename': filename,
                    'path': filepath,
                    'duration': duration,
                    'favorite': filename in self.favorites,
                    'format': os.path.splitext(filename)[1][1:].upper(),
                    'cover_data': cover_data  # Добавляем данные обложки
                }
                self.playlist.append(song_info)
            except Exception:
                song_info = {
                    'id': len(self.playlist),
                    'title': os.path.splitext(filename)[0],
                    'artist': 'Неизвестный артист',
                    'album': 'Без альбома',
                    'filename': filename,
                    'path': filepath,
                    'duration': 0,
                    'favorite': filename in self.favorites,
                    'format': os.path.splitext(filename)[1][1:].upper(),
                    'cover_data': None
                }
                self.playlist.append(song_info)

        return self.playlist

    def get_playlist(self):
        if not self.playlist:
            self.load_local_songs()
        return self.playlist

    def get_song_info(self, song_id):
        if 0 <= song_id < len(self.playlist):
            return self.playlist[song_id]
        return None

    def get_audio_file(self, filename):
        filepath = os.path.join(self.music_folder, filename)
        if os.path.exists(filepath):
            return filepath
        return None

    def toggle_favorite(self, filename):
        if filename in self.favorites:
            self.favorites.remove(filename)
        else:
            self.favorites.add(filename)
        self.save_data()

        for song in self.playlist:
            if song['filename'] == filename:
                song['favorite'] = filename in self.favorites
                break

        return filename in self.favorites

    def get_favorites(self):
        return [song for song in self.get_playlist() if song['filename'] in self.favorites]

    def search_songs(self, query):
        if not query:
            return self.get_playlist()

        query = query.lower()
        results = []
        for song in self.get_playlist():
            if (query in song['title'].lower() or
                    query in song['artist'].lower() or
                    query in song['album'].lower()):
                results.append(song)
        return results

    def download_from_youtube(self, url, is_search=False):
        if is_search:
            return self.youtube_downloader.search_and_download(url)
        else:
            return self.youtube_downloader.download_from_url(url)


player = MusicPlayer(MUSIC_FOLDER)


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/songs')
def get_songs():
    return jsonify(player.get_playlist())


@app.route('/api/song/<int:song_id>')
def get_song(song_id):
    song = player.get_song_info(song_id)
    if song:
        return jsonify(song)
    return jsonify({'error': 'Song not found'}), 404


@app.route('/api/play/<filename>')
def play_song(filename):
    filepath = player.get_audio_file(filename)
    if filepath:
        return send_file(filepath, mimetype='audio/mpeg')
    return jsonify({'error': 'File not found'}), 404


@app.route('/api/search')
def search_songs():
    return jsonify(player.search_songs(request.args.get('q', '').lower()))


@app.route('/api/favorite/<filename>', methods=['POST'])
def toggle_favorite(filename):
    return jsonify({'favorite': player.toggle_favorite(filename), 'filename': filename})


@app.route('/api/favorites')
def get_favorites():
    return jsonify(player.get_favorites())


@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(player.config)


@app.route('/api/settings', methods=['POST'])
def save_settings():
    player.config.update(request.json)
    player.save_config()
    return jsonify({'success': True})


@app.route('/api/locale/<lang>')
def get_locale(lang):
    return jsonify(JSONHandler.load_locale(lang))


@app.route('/api/download', methods=['POST'])
def download_song():
    data = request.json
    url = data.get('url', '')
    is_search = data.get('is_search', False)

    if not url:
        return jsonify({'success': False, 'error': 'URL is required'}), 400

    result = player.download_from_youtube(url, is_search)

    if result['success']:
        player.playlist = []
        player.load_local_songs()

    return jsonify(result)


@app.route('/api/import', methods=['POST'])
def import_songs():
    try:
        import shutil
        files = request.files.getlist('files')

        imported = []
        for file in files:
            if file.filename.lower().endswith(('.mp3', '.flac', '.wav', '.ogg', '.m4a', '.webm', '.mp4')):
                filepath = os.path.join(MUSIC_FOLDER, file.filename)
                file.save(filepath)
                imported.append(file.filename)

        if imported:
            player.playlist = []
            player.load_local_songs()

        return jsonify({'success': True, 'imported': imported})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/song/cover/<filename>')
def get_song_cover(filename):
    try:
        from player import AudioMetadata
        filepath = os.path.join(MUSIC_FOLDER, filename)

        if os.path.exists(filepath):
            metadata = AudioMetadata.get_metadata(filepath)
            if metadata and metadata.get('cover_data'):
                return jsonify({
                    'success': True,
                    'cover_data': metadata['cover_data']
                })

        return jsonify({'success': False, 'error': 'No cover found'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    app.run(debug=False, port=5000)