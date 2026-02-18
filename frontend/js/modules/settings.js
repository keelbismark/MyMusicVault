export class SettingsManager {
    constructor() {
        this.settings = {};
        this.originalSettings = {};
        this.tempSettings = null;
        this.tempColor = null;
        this.tempColorDark = null;
        this.tempTheme = null;
        this.tempLanguage = null;
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            this.settings = await response.json();
            this.originalSettings = { ...this.settings };
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return null;
        }
    }

    async saveSettings(settings = this.settings) {
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
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

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}
