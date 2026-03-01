export class LibraryManager {
    constructor() {
        this.songs = [];
        this.filteredSongs = [];
        this.unfilteredSongs = [];
        this.currentView = 'all';
        this.sortAZ = true;
        this.searchQuery = '';
    }

    async loadSongs() {
        try {
            const response = await fetch('/api/songs');
            this.songs = await response.json();
            this.unfilteredSongs = [...this.songs];
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
            const favorites = await response.json();
            this.unfilteredSongs = [...favorites];
            this.filteredSongs = [...favorites];
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
        this.searchQuery = query;
        if (!query) {
            this.filteredSongs = [...this.unfilteredSongs];
        } else {
            const q = query.toLowerCase();
            this.filteredSongs = this.unfilteredSongs.filter(song =>
                song.title.toLowerCase().includes(q) ||
                (song.artist && song.artist.toLowerCase().includes(q)) ||
                (song.album && song.album.toLowerCase().includes(q))
            );
        }
        this.applySorting();
        return this.filteredSongs;
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

    async refresh() {
        if (this.currentView === 'all') {
            await this.loadSongs();
        } else {
            await this.loadFavorites();
        }
        if (this.searchQuery) {
            await this.searchSongs(this.searchQuery);
        }
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