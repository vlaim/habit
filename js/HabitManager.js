class HabitManager {
    constructor() {
        this.habits = this.loadHabits();
        this.currentSortBy = localStorage.getItem('sortBy') || 'name';
        this.ensureGeneralTab();
    }
    // Garante que a aba geral existe e está sempre na posição 0
    ensureGeneralTab() {
        if (!this.habits.length || this.habits[0]?.isGeneral !== true) {
            const generalHabit = {
                id: -1,
                name: 'General',
                isGeneral: true,
                completedDates: [],
                streak: 0,
                motivationalMessages: [],
                currentDisplayMessage: null
            };
            this.habits.unshift(generalHabit);
            this.saveHabits();
        }
    }

    loadHabits() {
        const habits = JSON.parse(localStorage.getItem('habits')) || [];
        return habits.map(habit => {
            if (!habit.motivationalMessages) {
                habit.motivationalMessages = [];
            }
            if (habit.motivationalMessages.length > 0) {
                const randomIndex = Math.floor(Math.random() * habit.motivationalMessages.length);
                habit.currentDisplayMessage = habit.motivationalMessages[randomIndex];
            }
            return habit;
        });
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    addHabit(name) {
        if (!name || !name.trim()) return false;
        const habit = {
            id: Date.now(),
            name: name.trim(),
            completedDates: [],
            streak: 0,
            motivationalMessages: []
        };
        this.habits.push(habit);
        this.saveHabits();
        this.ensureGeneralTab();
        return true;
    }

    deleteHabit(id) {
        if (id === -1) return false; // Não pode excluir a aba geral
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return false;
        const confirmed = confirm(`Are you sure you want to delete the habit "${habit.name}"? This will permanently remove all ${habit.completedDates.length} completed days.`);
        if (confirmed) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.ensureGeneralTab();
            return true;
        }
        return false;
    }

    renameHabit(id, newName) {
        if (id === -1) return false; // Não pode renomear a aba geral
        const habit = this.habits.find(h => h.id === id);
        if (!habit || !newName || !newName.trim()) return false;
        habit.name = newName.trim();
        this.saveHabits();
        return true;
    }
    // Calcula a proporção de hábitos marcados para um dia
    getGeneralProgress(dateString) {
        // Não conta a aba geral
        const habits = this.habits.filter(h => !h.isGeneral);
        if (habits.length === 0) return 0;
        const completed = habits.filter(h => h.completedDates.includes(dateString)).length;
        return completed / habits.length;
    }

    toggleHabitDate(habitId, dateString) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;
        
        if (habit.completedDates.includes(dateString)) {
            habit.completedDates = habit.completedDates.filter(date => date !== dateString);
        } else {
            habit.completedDates.push(dateString);
        }
        
        this.updateStreak(habit);
        this.saveHabits();
        return true;
    }

    updateStreak(habit) {
        const today = new Date();
        let streak = 0;
        
        for (let i = 1; i < 366; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            if (habit.completedDates.includes(this.formatDateEuropean(checkDate))) {
                streak++;
            } else {
                break;
            }
        }
        
        habit.streak = streak;
    }

    formatDateEuropean(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isDateCompleted(habit, dateString) {
        return habit.completedDates.includes(dateString);
    }

    getYearStats(habit, year) {
        const yearDates = habit.completedDates.filter(date => date.startsWith(year.toString()));
        return yearDates.length;
    }

    setSortBy(sortBy) {
        this.currentSortBy = sortBy;
        localStorage.setItem('sortBy', sortBy);
    }

    getSortedHabits() {
        // A aba geral sempre fica no topo
        const general = this.habits.find(h => h.isGeneral);
        const others = this.habits.filter(h => !h.isGeneral);
        let sortedHabits;
        switch (this.currentSortBy) {
            case 'name':
                sortedHabits = others.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedHabits = others.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'streak':
                sortedHabits = others.sort((a, b) => b.streak - a.streak);
                break;
            case 'streak-asc':
                sortedHabits = others.sort((a, b) => a.streak - b.streak);
                break;
            case 'total':
                sortedHabits = others.sort((a, b) => b.completedDates.length - a.completedDates.length);
                break;
            case 'total-asc':
                sortedHabits = others.sort((a, b) => a.completedDates.length - b.completedDates.length);
                break;
            case 'recent':
                sortedHabits = others.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                sortedHabits = others.sort((a, b) => a.id - b.id);
                break;
            default:
                sortedHabits = others;
        }
        return general ? [general, ...sortedHabits] : sortedHabits;
    }

    clearAllData() {
        const totalDays = this.habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
        const message = this.habits.length > 0 
            ? `Are you sure you want to delete all ${this.habits.length} habit(s) and ${totalDays} completed days? This action cannot be undone.`
            : 'No data to clear.';
        
        if (this.habits.length > 0 && confirm(message)) {
            this.habits = [];
            this.saveHabits();
            return true;
        }
        return false;
    }

    importHabits(habits) {
        this.habits = habits;
        this.habits.forEach(habit => {
            if (!habit.motivationalMessages) {
                habit.motivationalMessages = [];
            }
            this.updateStreak(habit);
        });
        this.saveHabits();
    }

    getHabits() {
        return this.habits;
    }

    addMotivationalMessage(habitId, message) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !message || !message.trim()) return false;
        
        const messageObj = {
            id: Date.now(),
            text: message.trim(),
            createdAt: new Date().toISOString()
        };
        
        habit.motivationalMessages.push(messageObj);
        
        if (habit.motivationalMessages.length === 1) {
            habit.currentDisplayMessage = messageObj;
        }
        
        this.saveHabits();
        return true;
    }

    editMotivationalMessage(habitId, messageId, newText) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !newText || !newText.trim()) return false;
        
        const message = habit.motivationalMessages.find(m => m.id === messageId);
        if (!message) return false;
        
        message.text = newText.trim();
        this.saveHabits();
        return true;
    }

    deleteMotivationalMessage(habitId, messageId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;
        
        const wasCurrentMessage = habit.currentDisplayMessage && habit.currentDisplayMessage.id === messageId;
        
        habit.motivationalMessages = habit.motivationalMessages.filter(m => m.id !== messageId);
        
        if (wasCurrentMessage || !habit.currentDisplayMessage) {
            habit.currentDisplayMessage = habit.motivationalMessages.length > 0 ? habit.motivationalMessages[0] : null;
        }
        
        this.saveHabits();
        return true;
    }

    getRandomMotivationalMessage(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || habit.motivationalMessages.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * habit.motivationalMessages.length);
        return habit.motivationalMessages[randomIndex];
    }

    getNextMotivationalMessage(habitId, currentMessageId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || habit.motivationalMessages.length === 0) return null;
        
        if (habit.motivationalMessages.length === 1) {
            return habit.motivationalMessages[0];
        }
        
        const currentIndex = habit.motivationalMessages.findIndex(m => m.id === currentMessageId);
        const nextIndex = (currentIndex + 1) % habit.motivationalMessages.length;
        return habit.motivationalMessages[nextIndex];
    }
}