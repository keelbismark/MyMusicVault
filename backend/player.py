import mutagen
import base64
from mutagen.id3 import ID3
from mutagen.mp4 import MP4


class AudioMetadata:
    @staticmethod
    def get_duration(filepath):
        try:
            audio = mutagen.File(filepath)
            if audio and hasattr(audio.info, 'length'):
                return int(audio.info.length)
        except:
            pass
        return 0

    @staticmethod
    def get_metadata(filepath):
        try:
            audio = mutagen.File(filepath, easy=True)
            if audio:
                title = audio.get('title', [''])[0]
                artist = audio.get('artist', [''])[0]
                album = audio.get('album', [''])[0]
                duration = 0
                cover_data = None

                if hasattr(audio.info, 'length'):
                    duration = int(audio.info.length)

                try:
                    if filepath.lower().endswith('.mp3'):
                        audio_tags = ID3(filepath)
                        if 'APIC:' in audio_tags:
                            cover_data = base64.b64encode(audio_tags['APIC:'].data).decode('utf-8')
                        elif 'APIC' in audio_tags:
                            cover_data = base64.b64encode(audio_tags['APIC'].data).decode('utf-8')
                    elif filepath.lower().endswith('.m4a'):
                        audio_tags = MP4(filepath)
                        if 'covr' in audio_tags:
                            cover_data = base64.b64encode(audio_tags['covr'][0]).decode('utf-8')
                except:
                    cover_data = None

                return {
                    'title': title if title else AudioMetadata._get_title_from_filename(filepath),
                    'artist': artist if artist else 'Неизвестный артист',
                    'album': album if album else 'Без альбома',
                    'duration': duration,
                    'cover_data': cover_data
                }
        except:
            pass

        try:
            audio = mutagen.File(filepath)
            if audio:
                duration = 0
                cover_data = None

                if hasattr(audio.info, 'length'):
                    duration = int(audio.info.length)

                return {
                    'title': AudioMetadata._get_title_from_filename(filepath),
                    'artist': 'Неизвестный артист',
                    'album': 'Без альбома',
                    'duration': duration,
                    'cover_data': cover_data
                }
        except:
            pass

        return None

    @staticmethod
    def _get_title_from_filename(filepath):
        import os
        filename = os.path.basename(filepath)
        return os.path.splitext(filename)[0]