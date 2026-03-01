# My Music Vault

**My Music Vault** is a feature-rich, cross-platform desktop music player that combines a sleek web interface with a powerful Python backend. It allows you to manage your local music library, download songs from YouTube, edit metadata, and enjoy a personalized listening experience—all in one application.

Built with **Flask** (backend), **pywebview** (native window), and a modern responsive frontend, My Music Vault runs as a standalone desktop app while leveraging web technologies for the UI.

---

## Features

### 🎵 Music Playback
- Play local audio files: MP3, FLAC, WAV, OGG, M4A, WEBM, MP4.
- Basic playback controls: play/pause, next, previous, shuffle, repeat.
- Volume control and progress slider with time display.
- Displays current song title, artist, and album art (if embedded).

### 📚 Library Management
- Automatically scans your music folder on startup.
- Extracts metadata (title, artist, album, duration, cover art) using Mutagen.
- Sorts tracks alphabetically (A–Z / Z–A).
- Search bar to filter songs by title, artist, or album.
- Total track count and total duration statistics.

### ❤️ Favorites
- Mark any song as favorite (heart icon).
- View a dedicated “Favorites” list.
- Favorite status is saved persistently in `data.json`.

### 🌐 YouTube Downloader
- Download audio from YouTube or YouTube Music via URL.
- Embeds metadata (title, artist, album, year) and cover art into the downloaded M4A file.
- Attempts to fetch and embed lyrics (from closed captions).
- Uses `yt-dlp` for reliable downloading.

### 📂 Import Local Files
- Drag & drop or select files from your computer to import.
- Supports the same audio formats as the player.
- Imported files are copied to the music folder and appear in the library immediately.

### 🎨 Customizable Appearance
- Choose from preset accent colors or pick your own.
- Light and dark themes.
- Persistent settings stored in `config.json`.
- Multi-language support (English / Russian) – UI texts adapt instantly.

### ⚙️ Persistent Settings
- Volume level, shuffle/repeat state, theme, accent color, and language are saved.
- Settings can be reset to defaults.

### 🖼️ Album Art
- Displays embedded cover art from audio files (MP3 ID3 tags, M4A covr atom).
- Fallback icon if no cover is found.

### 📊 Statistics
- Total number of tracks in the current view.
- Total duration of all visible tracks.

---

## Installation

1. Download the latest version of the exe file from the releases
2. Launch
3. Enjoy!

---

## Usage

### Adding Music
- **Import files**: Click the **Add** button → **Import from folder** tab → drag & drop files or click to select.
- **Download from YouTube**: Click the **Add** button → **YouTube Music** tab → paste a URL → click **Download**.

### Playing Music
- Click any song in the list to play.
- Use the player bar controls (play/pause, previous, next, shuffle, repeat).
- Adjust volume with the slider on the right.
- Seek by dragging the progress slider.

### Managing Favorites
- Click the heart icon in the player bar or next to a song in the list to toggle favorite status.
- View all favorites by clicking **Favorites** in the sidebar.

### Searching and Sorting
- Type in the search bar to filter songs in real time.
- Click the sort button (A–Z / Z–A) to change sorting order.

### Settings
- Click the **Settings** (cog) icon in the sidebar to open the settings modal.
- Change accent color, language, theme, and default volume.
- Click **Save** to apply changes.

---

## Technologies Used

- **Backend**: Python, Flask, Flask-CORS
- **Audio Processing**: Mutagen, yt-dlp, Pillow (for image conversion)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 modules)
- **Desktop Window**: pywebview (uses Edge Chromium on Windows, WebKit on macOS/Linux)
- **Icons**: Font Awesome 6 (Free)

---

## License

This project is licensed under the **GNU General Public License v3.0**.  
See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for YouTube downloading.
- [Mutagen](https://mutagen.readthedocs.io/) for audio metadata handling.
- [pywebview](https://pywebview.flowrl.com/) for creating native windows.
- [Font Awesome](https://fontawesome.com/) for icons.
- All contributors and open-source projects that made this possible.

---

**Enjoy your music!** 🎧