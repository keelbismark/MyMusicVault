class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.getElementById('play-icon');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.likeBtn = document.getElementById('like-btn');
        this.likeIcon = this.likeBtn.querySelector('i');
        this.progress = document.getElementById('progress');
        this.progressSlider = document.getElementById('progress-slider');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volume-slider');
        this.songListBody = document.getElementById('song-list-body');
        this.nowPlayingTitle = document.getElementById('now-playing-title');
        this.nowPlayingArtist = document.getElementById('now-playing-artist');
        this.searchInput = document.getElementById('search-input');
        this.totalSongsEl = document.getElementById('total-songs');
        this.totalDurationEl = document.getElementById('total-duration');
        this.sortToggle = document.getElementById('sort-toggle');
        this.sortIcon = document.getElementById('sort-icon');
        this.sortText = document.getElementById('sort-text');
        this.navItems = document.querySelectorAll('.nav-item');
        this.libraryHeader = document.querySelector('.library-info h2');

        this.settingsModal = document.getElementById('settings-modal');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsClose = document.getElementById('settings-close');
        this.settingsCancel = document.getElementById('settings-cancel');
        this.settingsSave = document.getElementById('settings-save');
        this.colorPicker = document.getElementById('color-picker');
        this.colorInput = document.getElementById('color-input');
        this.colorPresets = document.querySelectorAll('.color-preset');
        this.languageBtns = document.querySelectorAll('.language-btn');
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.settingsVolumeSlider = document.getElementById('settings-volume-slider');
        this.settingsVolumeValue = document.getElementById('settings-volume-value');
        this.resetSettingsBtn = document.getElementById('reset-settings');

        this.addMusicModal = document.getElementById('add-music-modal');
        this.addMusicClose = document.getElementById('add-music-close');
        this.youtubeCancel = document.getElementById('youtube-cancel');
        this.importCancel = document.getElementById('import-cancel');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.youtubeUrl = document.getElementById('youtube-url');
        this.isSearchCheckbox = document.getElementById('is-search');
        this.youtubeDownloadBtn = document.getElementById('youtube-download');
        this.downloadStatus = document.getElementById('download-status');
        this.fileInput = document.getElementById('file-input');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.selectedFiles = document.getElementById('selected-files');
        this.importSubmitBtn = document.getElementById('import-submit');

        this.currentSongIndex = 0;
        this.songs = [];
        this.filteredSongs = [];
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = false;
        this.originalSongs = [];
        this.sortAZ = true;
        this.currentView = 'all';
        this.settings = {};
        this.locale = {};
        this.selectedColor = '#667eea';
        this.selectedColorDark = '#764ba2';
        this.originalSettings = {};

        this.albumArt = document.querySelector('.art-placeholder');
        this.songCoverImages = new Map();


        this.tempSettings = null;
        this.tempColor = null;
        this.tempColorDark = null;
        this.tempTheme = null;
        this.tempLanguage = null;

        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadLocale();
        await this.loadSongs();
        this.setupEventListeners();
        this.setupNavigation();
        this.setupSettings();
        this.setupAddMusicModal();
        this.updatePlayer();
        this.applySettings();
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            this.settings = await response.json();
            this.originalSettings = {...this.settings};

            this.selectedColor = this.settings.accent_color || '#667eea';
            this.selectedColorDark = this.settings.accent_color_dark || '#764ba2';

            this.audio.volume = this.settings.volume / 100;
            this.volumeSlider.value = this.settings.volume;
            this.settingsVolumeSlider.value = this.settings.volume;
            this.settingsVolumeValue.textContent = `${this.settings.volume}%`;

            if (this.settings.theme === 'light') {
                document.body.classList.add('light-theme');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadLocale() {
        try {
            const lang = this.settings.language || 'ru';
            const response = await fetch(`/api/locale/${lang}`);
            this.locale = await response.json();
            this.applyLocale();
        } catch (error) {
            console.error('Error loading locale:', error);
        }
    }

    applyLocale() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.locale[key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = this.locale[key];
                } else {
                    element.textContent = this.locale[key];
                }
            }
        });
    }

    applySettings() {
        this.applyAccentColor(this.selectedColor, this.selectedColorDark);
        this.updateActiveLanguage();
        this.updateActiveTheme();
    }

    applyAccentColor(color, darkColor) {
        const root = document.documentElement;

        root.style.setProperty('--accent-color', color);
        root.style.setProperty('--accent-color-dark', darkColor);

        const rgb = this.hexToRgb(color);
        const darkRgb = this.hexToRgb(darkColor);

        if (rgb) {
            root.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        if (darkRgb) {
            root.style.setProperty('--accent-color-dark-rgb', `${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b}`);
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    updateActiveLanguage() {
        const lang = this.settings.language || 'ru';
        this.languageBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateActiveTheme() {
        const theme = this.settings.theme || 'dark';
        this.themeBtns.forEach(btn => {
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    async loadSongs() {
        try {
            const response = await fetch('/api/songs');
            this.songs = await response.json();
            this.filteredSongs = [...this.songs];
            this.applySorting();
            this.originalSongs = [...this.songs];
            this.renderSongList();
            this.updateSongCount();
            this.updateTotalDuration();

            if (this.songs.length > 0) {
                this.currentSongIndex = 0;
                this.updateAudioSource();
            }
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    applySorting() {
        this.filteredSongs.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            return this.sortAZ ?
                titleA.localeCompare(titleB) :
                titleB.localeCompare(titleA);
        });
    }

    updateTotalDuration() {
        const totalSeconds = this.filteredSongs.reduce((total, song) => {
            return total + (song.duration || 0);
        }, 0);
        this.totalDurationEl.textContent = this.formatTime(totalSeconds);
    }

    toggleSort() {
        this.sortAZ = !this.sortAZ;

        if (this.sortAZ) {
            this.sortIcon.className = 'fas fa-sort-alpha-down';
            this.sortText.textContent = 'A-Z';
        } else {
            this.sortIcon.className = 'fas fa-sort-alpha-up';
            this.sortText.textContent = 'Z-A';
        }

        this.applySorting();
        this.renderSongList();
    }

    renderSongList() {
        this.songListBody.innerHTML = '';

        this.filteredSongs.forEach((song, index) => {
            const row = document.createElement('div');
            row.className = `song-row ${this.getOriginalIndex(song.filename) === this.currentSongIndex ? 'playing' : ''}`;
            row.onclick = () => this.playSong(this.getOriginalIndex(song.filename));

            const favoriteIcon = song.favorite ? 'fas fa-heart' : 'far fa-heart';
            const favoriteClass = song.favorite ? 'favorite' : '';

            let coverHTML = '<i class="fas fa-music"></i>';
            if (song.cover_data) {
                const coverId = `cover-${song.id || index}`;
                coverHTML = `<img src="data:image/jpeg;base64,${song.cover_data}"
                                 class="song-cover"
                                 alt="${song.title}"
                                 onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'fas fa-music\\'></i>'">`;
            }

            row.innerHTML = `
                <div class="table-cell song-number">${index + 1}</div>
                <div class="table-cell song-title">
                    <div class="song-cover-container">
                        ${coverHTML}
                    </div>
                    ${song.title}
                </div>
                <div class="table-cell song-artist">${song.artist || 'Неизвестный артист'}</div>
                <div class="table-cell song-album">${song.album || 'Без альбома'}</div>
                <div class="table-cell">
                    <button class="track-action-btn favorite-btn ${favoriteClass}" data-filename="${song.filename}">
                        <i class="${favoriteIcon}"></i>
                    </button>
                    <span class="song-duration">${this.formatTime(song.duration)}</span>
                </div>
            `;

            this.songListBody.appendChild(row);
        });

        this.setupFavoriteButtons();
    }


    getOriginalIndex(filename) {
        return this.songs.findIndex(song => song.filename === filename);
    }

    setupFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn.dataset.filename);
            };
        });
    }

    async loadSongCover(song) {
        if (this.songCoverImages.has(song.filename)) {
            return this.songCoverImages.get(song.filename);
        }

        try {
            const response = await fetch(`/api/song/cover/${encodeURIComponent(song.filename)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.cover_data) {
                    this.songCoverImages.set(song.filename, data.cover_data);
                    return data.cover_data;
                }
            }
        } catch (error) {
            console.error('Error loading cover:', error);
        }
        return null;
    }

    async toggleFavorite(filename) {
        try {
            const response = await fetch(`/api/favorite/${encodeURIComponent(filename)}`, {
                method: 'POST'
            });
            const data = await response.json();

            const songIndex = this.songs.findIndex(song => song.filename === filename);
            if (songIndex !== -1) {
                this.songs[songIndex].favorite = data.favorite;
            }

            const filteredIndex = this.filteredSongs.findIndex(song => song.filename === filename);
            if (filteredIndex !== -1) {
                this.filteredSongs[filteredIndex].favorite = data.favorite;
            }

            if (this.songs[this.currentSongIndex]?.filename === filename) {
                this.updateLikeButton(data.favorite);
            }

            if (this.currentView === 'favorites') {
                await this.loadFavorites();
            } else {
                this.renderSongList();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }

    updateLikeButton(isFavorite) {
        if (isFavorite) {
            this.likeIcon.className = 'fas fa-heart';
            this.likeBtn.style.color = '#ff4757';
            this.likeBtn.classList.add('favorite');
        } else {
            this.likeIcon.className = 'far fa-heart';
            this.likeBtn.style.color = '';
            this.likeBtn.classList.remove('favorite');
        }
    }

    updateSongCount() {
        this.totalSongsEl.textContent = this.filteredSongs.length;
    }

    playSong(index) {
        if (index >= 0 && index < this.songs.length) {
            this.currentSongIndex = index;
            this.updateAudioSource();
            this.play();
            this.updatePlayer();
            this.renderSongList();
        }
    }

    updateAudioSource() {
        const song = this.songs[this.currentSongIndex];
        if (song) {
            this.audio.src = `/api/play/${encodeURIComponent(song.filename)}`;
            this.nowPlayingTitle.textContent = song.title;
            this.nowPlayingArtist.textContent = song.artist || 'Неизвестный артист';
            this.updateLikeButton(song.favorite);

            this.updateAlbumArt(song);

            this.audio.onloadedmetadata = () => {
                this.durationEl.textContent = this.formatTime(this.audio.duration);
                if (song.duration === 0) {
                    song.duration = this.audio.duration;
                    this.updateTotalDuration();
                }
            };
        }
    }

    updateAlbumArt(song) {
    if (song.cover_data) {
        const img = document.createElement('img');
        img.src = `data:image/jpeg;base64,${song.cover_data}`;
        img.className = 'cover-image';
        img.alt = song.title;

        this.albumArt.innerHTML = '';
        this.albumArt.appendChild(img);
    } else {
        this.albumArt.innerHTML = '<i class="fas fa-compact-disc"></i>';
    }
}

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playIcon.className = 'fas fa-pause';
        this.playBtn.classList.add('playing');
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playIcon.className = 'fas fa-play';
        this.playBtn.classList.remove('playing');
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    next() {
        if (this.shuffleMode) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
        this.updateAudioSource();
        this.play();
        this.updatePlayer();
        this.renderSongList();
    }

    prev() {
        if (this.shuffleMode) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        }
        this.updateAudioSource();
        this.play();
        this.updatePlayer();
        this.renderSongList();
    }

    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        this.shuffleBtn.classList.toggle('active', this.shuffleMode);

        if (this.shuffleMode) {
            this.shuffleSongs();
        } else {
            this.filteredSongs = [...this.songs];
            this.applySorting();
            this.renderSongList();
        }
    }

    shuffleSongs() {
        const shuffled = [...this.filteredSongs];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.filteredSongs = shuffled;
        this.renderSongList();
    }

    toggleRepeat() {
        this.repeatMode = !this.repeatMode;
        this.repeatBtn.classList.toggle('active', this.repeatMode);
    }

    updatePlayer() {
        const song = this.songs[this.currentSongIndex];
        if (song) {
            this.nowPlayingTitle.textContent = song.title;
            this.nowPlayingArtist.textContent = song.artist || 'Неизвестный артист';
            this.updateLikeButton(song.favorite);
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration || 1;
        const progressPercent = (currentTime / duration) * 100;

        this.progress.style.width = `${progressPercent}%`;
        this.progressSlider.value = progressPercent;
        this.currentTimeEl.textContent = this.formatTime(currentTime);
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.likeBtn.addEventListener('click', () => {
            const currentSong = this.songs[this.currentSongIndex];
            if (currentSong) {
                this.toggleFavorite(currentSong.filename);
            }
        });
        this.sortToggle.addEventListener('click', () => this.toggleSort());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());

        this.progressSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.progress.style.width = `${value}%`;
            this.audio.currentTime = (value / 100) * this.audio.duration;
        });

        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.audio.volume = volume / 100;
            this.settings.volume = parseInt(volume);
            this.saveSettings();
        });

        this.searchInput.addEventListener('input', async (e) => {
            const query = e.target.value;
            await this.searchSongs(query);
        });

        this.audio.addEventListener('ended', () => {
            if (this.repeatMode) {
                this.audio.currentTime = 0;
                this.play();
            } else {
                this.next();
            }
        });

        document.getElementById('add-music-btn').addEventListener('click', () => {
            this.openAddMusicModal();
        });
    }

    setupNavigation() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.id === 'settings-btn') {
                    this.openSettings();
                    return;
                }

                this.navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                const view = item.dataset.view;
                this.handleNavigation(view);
            });
        });
    }

    setupSettings() {
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.settingsClose.addEventListener('click', () => this.closeSettings(false));
        this.settingsCancel.addEventListener('click', () => this.closeSettings(false));
        this.settingsSave.addEventListener('click', () => this.saveSettingsFromForm());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                const darkColor = preset.dataset.colorDark;
                this.tempColor = color;
                this.tempColorDark = darkColor;
                this.colorPicker.value = color;
                this.colorInput.value = color;
                this.applyTempAccentColor(color, darkColor);
                this.updateColorPresets();
            });
        });

        this.colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            this.colorInput.value = color;
            this.tempColor = color;
            this.tempColorDark = this.darkenColor(color, 20);
            this.applyTempAccentColor(color, this.tempColorDark);
            this.updateColorPresets();
        });

        this.colorInput.addEventListener('input', (e) => {
            let color = e.target.value;
            if (color.startsWith('#')) {
                if (color.length === 4) {
                    color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
                }
                if (this.isValidHex(color)) {
                    this.colorPicker.value = color;
                    this.tempColor = color;
                    this.tempColorDark = this.darkenColor(color, 20);
                    this.applyTempAccentColor(color, this.tempColorDark);
                    this.updateColorPresets();
                }
            }
        });

        this.languageBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.languageBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.tempLanguage = btn.dataset.lang;
            });
        });

        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.tempTheme = btn.dataset.theme;
                this.applyTempTheme(this.tempTheme);
            });
        });

        this.settingsVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.settingsVolumeValue.textContent = `${volume}%`;
            this.tempSettings.volume = parseInt(volume);
        });
    }

    setupAddMusicModal() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.tabBtns.forEach(b => b.classList.remove('active'));
                this.tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${tab}-tab`).classList.add('active');
            });
        });

        this.addMusicClose.addEventListener('click', () => this.closeAddMusicModal());
        this.youtubeCancel.addEventListener('click', () => this.closeAddMusicModal());
        this.importCancel.addEventListener('click', () => this.closeAddMusicModal());

        this.youtubeDownloadBtn.addEventListener('click', () => this.downloadFromYouTube());

        this.youtubeUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.downloadFromYouTube();
            }
        });

        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.style.borderColor = 'var(--accent-color)';
        });
        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.style.borderColor = '';
        });
        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.style.borderColor = '';
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files);
            }
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        this.importSubmitBtn.addEventListener('click', () => this.uploadFiles());
    }

    openAddMusicModal() {
        this.addMusicModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.youtubeUrl.value = '';
        this.isSearchCheckbox.checked = false;
        this.downloadStatus.textContent = '';
        this.downloadStatus.className = 'download-status';
        this.selectedFiles.innerHTML = '';
        this.fileInput.value = '';
    }

    closeAddMusicModal() {
        this.addMusicModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async downloadFromYouTube() {
        const url = this.youtubeUrl.value.trim();
        if (!url) {
            this.showStatus('Введите ссылку или поисковый запрос', 'error');
            return;
        }

        this.youtubeDownloadBtn.disabled = true;
        this.showStatus('Скачивание началось...', '');

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    is_search: this.isSearchCheckbox.checked
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showStatus(`Успешно скачан: ${result.title} - ${result.artist}`, 'success');
                this.youtubeUrl.value = '';

                await this.loadSongs();

                setTimeout(() => {
                    this.closeAddMusicModal();
                }, 2000);
            } else {
                this.showStatus(`Ошибка: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showStatus(`Ошибка сети: ${error.message}`, 'error');
        } finally {
            this.youtubeDownloadBtn.disabled = false;
        }
    }

    showStatus(message, type) {
        this.downloadStatus.textContent = message;
        this.downloadStatus.className = 'download-status';
        if (type) {
            this.downloadStatus.classList.add(type);
        }
    }

    handleFileSelect(files) {
        this.selectedFiles.innerHTML = '';
        const fileList = Array.from(files);

        fileList.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            `;
            this.selectedFiles.appendChild(fileItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadFiles() {
        if (this.fileInput.files.length === 0) {
            this.showToast('Выберите файлы для импорта');
            return;
        }

        this.importSubmitBtn.disabled = true;
        this.importSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Импортируется...</span>';

        const formData = new FormData();
        for (let i = 0; i < this.fileInput.files.length; i++) {
            formData.append('files', this.fileInput.files[i]);
        }

        try {
            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(`Импортировано ${result.imported.length} файлов`);

                await this.loadSongs();

                setTimeout(() => {
                    this.closeAddMusicModal();
                }, 1000);
            } else {
                this.showToast(`Ошибка импорта: ${result.error}`);
            }
        } catch (error) {
            this.showToast(`Ошибка сети: ${error.message}`);
        } finally {
            this.importSubmitBtn.disabled = false;
            this.importSubmitBtn.innerHTML = '<i class="fas fa-upload"></i><span data-i18n="buttons.import">Импортировать</span>';
        }
    }

    isValidHex(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;

        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    updateColorPresets() {
        this.colorPresets.forEach(preset => {
            if (preset.dataset.color === this.tempColor) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
    }

    applyTempAccentColor(color, darkColor) {
        const root = document.documentElement;
        root.style.setProperty('--accent-color', color);
        root.style.setProperty('--accent-color-dark', darkColor);
    }

    applyTempTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    openSettings() {
        this.tempSettings = {...this.settings};
        this.tempColor = this.settings.accent_color;
        this.tempColorDark = this.settings.accent_color_dark;
        this.tempTheme = this.settings.theme;
        this.tempLanguage = this.settings.language;

        this.colorPicker.value = this.tempColor;
        this.colorInput.value = this.tempColor;
        this.settingsVolumeSlider.value = this.tempSettings.volume;
        this.settingsVolumeValue.textContent = `${this.tempSettings.volume}%`;

        this.languageBtns.forEach(btn => {
            if (btn.dataset.lang === this.tempLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.themeBtns.forEach(btn => {
            if (btn.dataset.theme === this.tempTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.updateColorPresets();
        this.settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettings(save = false) {
        if (!save) {
            this.applyAccentColor(this.selectedColor, this.selectedColorDark);
            if (this.settings.theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
        }

        this.settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async saveSettingsFromForm() {
        this.settings.accent_color = this.tempColor;
        this.settings.accent_color_dark = this.tempColorDark;
        this.settings.theme = this.tempTheme;
        this.settings.language = this.tempLanguage;
        this.settings.volume = this.tempSettings.volume;

        this.selectedColor = this.tempColor;
        this.selectedColorDark = this.tempColorDark;

        await this.saveSettings();
        await this.loadLocale();
        this.closeSettings(true);
        this.showToast(this.locale['settings.saved'] || 'Настройки сохранены!');
    }

    async saveSettings() {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.settings)
            });

            this.audio.volume = this.settings.volume / 100;
            this.volumeSlider.value = this.settings.volume;

            if (this.settings.theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async resetSettings() {
        if (confirm(this.locale['settings.reset_confirm'] || 'Все настройки будут сброшены. Продолжить?')) {
            this.settings = {...this.originalSettings};
            this.selectedColor = this.settings.accent_color;
            this.selectedColorDark = this.settings.accent_color_dark;
            this.colorPicker.value = this.selectedColor;
            this.colorInput.value = this.selectedColor;
            this.settingsVolumeSlider.value = this.settings.volume;
            this.settingsVolumeValue.textContent = `${this.settings.volume}%`;

            this.updateActiveLanguage();
            this.updateActiveTheme();
            this.updateColorPresets();
            this.applyAccentColor(this.selectedColor, this.selectedColorDark);

            await this.saveSettings();
            await this.loadLocale();
            this.showToast(this.locale['settings.saved'] || 'Настройки сохранены!');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    async handleNavigation(view) {
        if (view === 'all') {
            this.currentView = 'all';
            this.libraryHeader.textContent = this.locale['nav.all_tracks'] || 'Все треки';
            this.filteredSongs = [...this.songs];
            this.applySorting();
            this.renderSongList();
            this.updateSongCount();
            this.updateTotalDuration();
        } else if (view === 'favorites') {
            this.currentView = 'favorites';
            this.libraryHeader.textContent = this.locale['nav.favorites'] || 'Избранное';
            await this.loadFavorites();
        }
    }

    async loadFavorites() {
        try {
            const response = await fetch('/api/favorites');
            this.filteredSongs = await response.json();
            this.applySorting();
            this.renderSongList();
            this.updateSongCount();
            this.updateTotalDuration();
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    async searchSongs(query) {
        try {
            const url = query ? `/api/search?q=${encodeURIComponent(query)}` : '/api/songs';
            const response = await fetch(url);
            const results = await response.json();

            if (this.currentView === 'all') {
                this.filteredSongs = results;
            } else if (this.currentView === 'favorites') {
                this.filteredSongs = results.filter(song => song.favorite);
            }

            this.applySorting();
            this.renderSongList();
            this.updateSongCount();
            this.updateTotalDuration();
        } catch (error) {
            console.error('Error searching songs:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.player = new MusicPlayer();
});