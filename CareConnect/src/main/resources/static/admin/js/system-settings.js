document.addEventListener('DOMContentLoaded', function() {
    // Handle tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const settingsTabs = document.querySelectorAll('.settings-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            settingsTabs.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show the corresponding tab
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Handle Save Changes button
    const saveButton = document.querySelector('.settings-actions .btn.primary');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            alert('Settings saved successfully!\n\nIn a real implementation, this would save all settings to the server.');
        });
    }

    // Handle Reset to Defaults button
    const resetButton = document.querySelector('.settings-actions .btn.secondary');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all settings to their default values?')) {
                alert('Settings reset to defaults!\n\nIn a real implementation, this would restore all settings to their default values.');
            }
        });
    }
});