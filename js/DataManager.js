class DataManager {
    constructor(habitManager) {
        this.habitManager = habitManager;
    }

    exportData() {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: "1.0",
            habits: this.habitManager.getHabits()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.habits && Array.isArray(importedData.habits)) {
                    if (this.habitManager.getHabits().length > 0) {
                        if (!confirm('This will replace all your current habits. Are you sure you want to continue?')) {
                            return;
                        }
                    }
                    
                    this.habitManager.importHabits(importedData.habits);
                    alert('Data imported successfully!');
                    
                    if (window.app && typeof window.app.renderHabits === 'function') {
                        window.app.renderHabits();
                    }
                } else {
                    alert('Invalid file format. Please select a valid habit tracker backup file.');
                }
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    clearAllData() {
        const success = this.habitManager.clearAllData();
        if (success) {
            alert('All data has been cleared.');
            if (window.app && typeof window.app.renderHabits === 'function') {
                window.app.renderHabits();
            }
        }
    }

    setupImportButton() {
        const importButton = document.querySelector('button[onclick="document.getElementById(\'importFile\').click()"]');
        if (importButton) {
            importButton.onclick = () => document.getElementById('importFile').click();
        }

        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.onchange = (event) => this.importData(event);
        }
    }
}