class App {
    constructor() {
        this.habitManager = new HabitManager();
        this.themeManager = new ThemeManager();
        this.calendarRenderer = new CalendarRenderer();
        this.dataManager = new DataManager(this.habitManager);
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeSortDropdown();
        this.dataManager.setupImportButton();
        this.renderHabits();
    }

    setupEventListeners() {
        const habitInput = document.getElementById('habitInput');
        if (habitInput) {
            habitInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addHabit();
                }
            });
        }

        const themeButton = document.getElementById('themeButton');
        if (themeButton) {
            themeButton.onclick = () => this.toggleTheme();
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.onchange = () => this.updateSorting();
        }
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const habitName = input.value.trim();
        
        if (this.habitManager.addHabit(habitName)) {
            input.value = '';
            this.renderHabits();
        }
    }

    deleteHabit(id) {
        if (this.habitManager.deleteHabit(id)) {
            this.renderHabits();
        }
    }

    renameHabit(id) {
        const habit = this.habitManager.getHabits().find(h => h.id === id);
        if (!habit) return;
        
        const newName = prompt(`Rename habit "${habit.name}" to:`, habit.name);
        
        if (newName && newName.trim() && newName.trim() !== habit.name) {
            if (this.habitManager.renameHabit(id, newName)) {
                this.renderHabits();
            }
        }
    }

    toggleHabitDate(habitId, dateString) {
        if (this.habitManager.toggleHabitDate(habitId, dateString)) {
            this.renderHabits();
        }
    }

    updateSorting() {
        const sortSelect = document.getElementById('sortSelect');
        this.habitManager.setSortBy(sortSelect.value);
        this.renderHabits();
    }

    initializeSortDropdown() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = this.habitManager.currentSortBy;
        }
    }

    changeYear(direction) {
        this.calendarRenderer.changeYear(direction);
        this.renderHabits();
    }

    renderHabits() {
        this.calendarRenderer.renderHabits(this.habitManager);
    }

    toggleTheme() {
        this.themeManager.toggleTheme();
    }

    showTooltip(event, dateString) {
        this.calendarRenderer.showTooltip(event, dateString);
    }

    hideTooltip() {
        this.calendarRenderer.hideTooltip();
    }

    exportData() {
        this.dataManager.exportData();
    }

    importData(event) {
        this.dataManager.importData(event);
    }

    clearAllData() {
        this.dataManager.clearAllData();
    }
}

window.app = new App();