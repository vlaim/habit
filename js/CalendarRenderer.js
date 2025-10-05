class CalendarRenderer {
    constructor() {
        this.currentViewYear = new Date().getFullYear();
    }

    setCurrentViewYear(year) {
        this.currentViewYear = year;
    }

    getCurrentViewYear() {
        return this.currentViewYear;
    }

    changeYear(direction) {
        this.currentViewYear += direction;
    }

    formatDateEuropean(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    generateCalendar(habit) {
        const today = new Date();
        const startDate = new Date(this.currentViewYear, 0, 1);
        const endDate = new Date(this.currentViewYear, 11, 31);
        
        const firstDay = startDate.getDay();
        const calendarStart = new Date(startDate);
        calendarStart.setDate(startDate.getDate() - firstDay);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let calendar = '<div class="calendar">';
        
        calendar += `
            <div class="year-controls">
                <button class="year-btn" onclick="app.changeYear(-1)">←</button>
                <div class="current-year">${this.currentViewYear}</div>
                <button class="year-btn" onclick="app.changeYear(1)" ${this.currentViewYear >= today.getFullYear() ? 'disabled' : ''}>→</button>
            </div>
        `;
        
        calendar += '<div class="calendar-grid">';
        
        for (let i = 0; i < 371; i++) {
            const currentDate = new Date(calendarStart);
            currentDate.setDate(calendarStart.getDate() + i);
            
            if (currentDate.getFullYear() > this.currentViewYear) break;
            
            const dateString = this.formatDateEuropean(currentDate);
            const isCompleted = habit.completedDates.includes(dateString);
            const isToday = dateString === this.formatDateEuropean(today) && this.currentViewYear === today.getFullYear();
            const isCurrentYear = currentDate.getFullYear() === this.currentViewYear;
            
            const dayOfWeek = currentDate.getDay();
            const weekIndex = Math.floor(i / 7);
            
            calendar += `
                <div class="day-square ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isCurrentYear ? 'other-year' : ''}"
                     onclick="app.toggleHabitDate(${habit.id}, '${dateString}')"
                     onmouseenter="app.showTooltip(event, '${dateString}')"
                     onmouseleave="app.hideTooltip()"
                     style="grid-column: ${weekIndex + 1}; grid-row: ${dayOfWeek + 1}; ${!isCurrentYear ? 'opacity: 0.3;' : ''}">
                </div>
            `;
        }
        
        calendar += '</div></div>';
        return calendar;
    }

    renderHabits(habitManager) {
        const habitsList = document.getElementById('habitsList');
        
        if (habitManager.getHabits().length === 0) {
            habitsList.innerHTML = '<p style="text-align: center; color: #666;">No habits yet. Add one above!</p>';
            return;
        }
        
        const sortedHabits = habitManager.getSortedHabits();
        
        habitsList.innerHTML = sortedHabits.map(habit => {
            const currentYear = new Date().getFullYear();
            const yearTotal = habitManager.getYearStats(habit, this.currentViewYear);
            const isCurrentYear = this.currentViewYear === currentYear;
            
            return `
            <div class="habit">
                <div class="habit-header">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-stats">
                        ${isCurrentYear ? `<span>Current Streak: ${habit.streak} days</span>` : ''}
                        <span>${this.currentViewYear}: ${yearTotal} days</span>
                        <span>All Time: ${habit.completedDates.length} days</span>
                        <button class="settings-btn" onclick="app.openHabitSettings(${habit.id})" title="Motivational Messages">⚙️</button>
                        <button class="rename-btn" onclick="app.renameHabit(${habit.id})">Rename</button>
                        <button class="delete-btn" onclick="app.deleteHabit(${habit.id})">Delete</button>
                    </div>
                </div>
                ${this.generateMotivationalMessageArea(habit)}
                ${this.generateCalendar(habit)}
            </div>
        `}).join('');
    }

    generateMotivationalMessageArea(habit) {
        if (!habit.motivationalMessages || habit.motivationalMessages.length === 0) {
            return '';
        }

        const currentMessage = habit.currentDisplayMessage || habit.motivationalMessages[0];
        
        return `
            <div class="motivational-message-area">
                <div class="motivational-message" id="motivational-message-${habit.id}">
                    "${currentMessage.text}"
                </div>
                ${habit.motivationalMessages.length > 1 ? `
                    <button class="next-message-btn" onclick="app.showNextMotivationalMessage(${habit.id})" title="Next message">→</button>
                ` : ''}
            </div>
        `;
    }

    showTooltip(event, dateString) {
        const tooltip = document.getElementById('globalTooltip');
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        tooltip.textContent = formattedDate;
        tooltip.style.opacity = '1';
        
        const rect = event.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 8;
        
        if (left < 0) left = 8;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top < 0) {
            top = rect.bottom + 8;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('globalTooltip');
        tooltip.style.opacity = '0';
    }
}