import json
import os
import sys
from pathlib import Path

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = get_base_dir()
DATA_FILE = f"{BASE_DIR}/data.json"
CONFIG_FILE = f"{BASE_DIR}/config.json"
LOCALES_DIR = Path(__file__).parent / '../locales'

class JSONHandler:
    @staticmethod
    def load_data():
        default_data = {
            'favorites': [],
            'playlists': [],
            'user_settings': {}
        }

        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return default_data
        return default_data

    @staticmethod
    def save_data(data):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    @staticmethod
    def load_config():
        default_config = {
            'volume': 100,
            'repeat': False,
            'shuffle': False,
            'theme': 'dark',
            'accent_color': '#ff565f',
            'language': 'en',
            'accent_color_dark': '#ff565f'
        }

        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    if 'accent_color' not in config:
                        config['accent_color'] = default_config['accent_color']
                    if 'accent_color_dark' not in config:
                        config['accent_color_dark'] = default_config['accent_color_dark']
                    return config
            except:
                return default_config
        return default_config

    @staticmethod
    def save_config(config):
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)

    @staticmethod
    def load_locale(lang):
        locale_file = LOCALES_DIR / f'{lang}.json'
        default_locale = LOCALES_DIR / 'ru.json'

        if os.path.exists(locale_file):
            try:
                with open(locale_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass

        if os.path.exists(default_locale):
            try:
                with open(default_locale, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass

        return {}