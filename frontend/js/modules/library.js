export class LibraryManager {
    constructor() {
        this.songs = [];
        this.filteredSongs = [];
        this.currentView = 'all';
        this.sortAZ = true;
    }

    async loadSongs() {
        try {
            const response = await fetch('/api/songs');
            this.songs = await response.json();
            this.filteredSongs = [...this.songs];
            this.applySorting();
            return this.songs;
        } catch (error) {
            console.error('Error loading songs:', error);
            return [];
        }
    }

    async loadFavorites() {
        try {
            const response = await fetch('/api/favorites');
            this.filteredSongs = await response.json();
            this.applySorting();
            return this.filteredSongs;
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
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

            return data.favorite;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
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
            return this.filteredSongs;
        } catch (error) {
            console.error('Error searching songs:', error);
            return [];
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

    getOriginalIndex(filename) {
        return this.songs.findIndex(song => song.filename === filename);
    }

    getTotalDuration() {
        return this.filteredSongs.reduce((total, song) => {
            return total + (song.duration || 0);
        }, 0);
    }
}
