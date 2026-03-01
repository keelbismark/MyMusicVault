export class Uploader {
    constructor() {
        this.selectedFiles = [];
    }

    async downloadFromYouTube(url) {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
            return await response.json();
        } catch (error) {
            console.error('YouTube download error:', error);
            throw error;
        }
    }

    async uploadFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
}