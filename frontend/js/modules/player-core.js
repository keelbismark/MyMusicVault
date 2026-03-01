export class PlayerCore {
    constructor(audioElement) {
        this.audio = audioElement;
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.shuffleMode = false;
        this.repeatMode = false;
        this.songs = [];
    }

    setSongs(songs) {
        this.songs = songs;
    }

    playSong(index) {
        if (index >= 0 && index < this.songs.length) {
            this.currentSongIndex = index;
            this.updateAudioSource();
            this.play();
        }
    }

    updateAudioSource() {
        const song = this.songs[this.currentSongIndex];
        if (song) {
            this.audio.src = `/api/play/${encodeURIComponent(song.filename)}`;
        }
    }

    play() {
        if (this.audio.src) {
            this.audio.play();
            this.isPlaying = true;
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    next() {
        if (this.songs.length === 0) return;
        if (this.shuffleMode) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        }
        this.updateAudioSource();
        this.play();
    }

    prev() {
        if (this.songs.length === 0) return;
        if (this.shuffleMode) {
            this.currentSongIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        }
        this.updateAudioSource();
        this.play();
    }

    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        return this.shuffleMode;
    }

    toggleRepeat() {
        this.repeatMode = !this.repeatMode;
        return this.repeatMode;
    }

    setVolume(value) {
        this.audio.volume = value / 100;
    }

    getCurrentSong() {
        return this.songs[this.currentSongIndex];
    }
}
