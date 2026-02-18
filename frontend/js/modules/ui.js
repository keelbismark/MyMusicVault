export class UIManager {
    constructor() {
        this.locale = {};
    }

    async loadLocale(lang) {
        try {
            const response = await fetch(`/api/locale/${lang}`);
            this.locale = await response.json();
            this.applyLocale();
            return this.locale;
        } catch (error) {
            console.error('Error loading locale:', error);
            return null;
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

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
