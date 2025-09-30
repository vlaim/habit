class ThemeManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem('theme');
        let isDark;
        
        if (savedTheme) {
            isDark = savedTheme === 'dark';
        } else {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        this.setTheme(isDark ? 'dark' : 'light');
        this.updateThemeButton(isDark);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        this.updateThemeButton(newTheme === 'dark');
    }

    updateThemeButton(isDark) {
        const button = document.getElementById('themeButton');
        if (button) {
            button.textContent = isDark ? '☀️' : '🌙';
            button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        }
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme');
    }

    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
}