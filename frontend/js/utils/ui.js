/**
 * UI Controller
 * Manages Sidebar collapse state and Theme toggling.
 */
export default class UIControl {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebarToggle');
        
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggleBtn ? this.themeToggleBtn.querySelector('i') : null;
        
        this.body = document.body;

        this.init();
    }

    init() {
        // Event Listeners
        if (this.sidebarToggleBtn) {
            this.sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Load State
        this.loadState();
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        
        // Save state
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        
        // Update Icon (optional, depends on HTML structure)
        const icon = this.sidebarToggleBtn.querySelector('i');
        if (icon) {
            icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
        }
    }

    toggleTheme() {
        this.body.classList.toggle('dark-mode');
        const isDark = this.body.classList.contains('dark-mode');
        
        // Save state
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Update Icon
        this.updateThemeIcon(isDark);
    }

    updateThemeIcon(isDark) {
        if (!this.themeIcon) return;
        
        if (isDark) {
            this.themeIcon.className = 'fas fa-sun';
        } else {
            this.themeIcon.className = 'fas fa-moon';
        }
    }

    loadState() {
        // Sidebar
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.sidebar.classList.add('collapsed');
            const icon = this.sidebarToggleBtn?.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-right';
        }

        // Theme
        const storedTheme = localStorage.getItem('theme');
        // Default to dark mode if no preference, or respect stored
        // User requested 'Define body.dark-mode... for dark theme'. 
        // Assuming light is default in CSS, so only add class if storedTheme is dark.
        if (storedTheme === 'dark') {
            this.body.classList.add('dark-mode');
            this.updateThemeIcon(true);
        } else {
            this.updateThemeIcon(false);
        }
    }
}

// Auto-initialize when imported if document is ready, or wait
document.addEventListener('DOMContentLoaded', () => {
    // Only init if not already instantiated or if we want global access
    window.uiControl = new UIControl();
});
