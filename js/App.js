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

    openHabitSettings(habitId) {
        this.createSettingsModal(habitId);
    }

    createSettingsModal(habitId) {
        const habit = this.habitManager.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        const existingModal = document.getElementById('habit-settings-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'habit-settings-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Motivational Messages for "${habit.name}"</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="add-message-form">
                        <textarea id="new-message-input" placeholder="Enter a motivational message..."></textarea>
                        <button onclick="app.addMotivationalMessage(${habitId})">Add Message</button>
                    </div>
                    <div class="messages-list" id="messages-list-${habitId}">
                        ${this.renderMessagesList(habit.motivationalMessages || [], habitId)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderMessagesList(messages, habitId) {
        if (messages.length === 0) {
            return '<p class="no-messages">No motivational messages yet. Add one above!</p>';
        }

        return messages.map(message => `
            <div class="message-item" data-message-id="${message.id}">
                <div class="message-text">"${message.text}"</div>
                <div class="message-actions">
                    <button onclick="app.editMotivationalMessage(${habitId}, ${message.id})">Edit</button>
                    <button onclick="app.deleteMotivationalMessage(${habitId}, ${message.id})" class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    }

    addMotivationalMessage(habitId) {
        const input = document.getElementById('new-message-input');
        const message = input.value.trim();
        
        if (message && this.habitManager.addMotivationalMessage(habitId, message)) {
            input.value = '';
            this.updateMessagesList(habitId);
            this.renderHabits();
        }
    }

    editMotivationalMessage(habitId, messageId) {
        const habit = this.habitManager.getHabits().find(h => h.id === habitId);
        const message = habit.motivationalMessages.find(m => m.id === messageId);
        if (!message) return;

        const newText = prompt('Edit motivational message:', message.text);
        if (newText && newText.trim() && newText.trim() !== message.text) {
            if (this.habitManager.editMotivationalMessage(habitId, messageId, newText)) {
                this.updateMessagesList(habitId);
                this.renderHabits();
            }
        }
    }

    deleteMotivationalMessage(habitId, messageId) {
        if (confirm('Are you sure you want to delete this motivational message?')) {
            if (this.habitManager.deleteMotivationalMessage(habitId, messageId)) {
                this.updateMessagesList(habitId);
                this.renderHabits();
            }
        }
    }

    updateMessagesList(habitId) {
        const habit = this.habitManager.getHabits().find(h => h.id === habitId);
        const messagesList = document.getElementById(`messages-list-${habitId}`);
        if (messagesList) {
            messagesList.innerHTML = this.renderMessagesList(habit.motivationalMessages || [], habitId);
        }
    }

    showNextMotivationalMessage(habitId) {
        const habit = this.habitManager.getHabits().find(h => h.id === habitId);
        if (!habit || !habit.motivationalMessages || habit.motivationalMessages.length === 0) return;

        const currentMessageId = habit.currentDisplayMessage ? habit.currentDisplayMessage.id : habit.motivationalMessages[0].id;
        const nextMessage = this.habitManager.getNextMotivationalMessage(habitId, currentMessageId);
        
        if (nextMessage) {
            habit.currentDisplayMessage = nextMessage;
            this.habitManager.saveHabits();
            const messageElement = document.getElementById(`motivational-message-${habitId}`);
            if (messageElement) {
                messageElement.textContent = `"${nextMessage.text}"`;
            }
        }
    }
}

window.app = new App();