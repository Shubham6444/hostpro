class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('whatsapp-theme') || 'default';
    this.currentMode = localStorage.getItem('whatsapp-mode') || 'dark';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.applyMode(this.currentMode);
    this.attachEventListeners();
    this.updateActiveButtons();
  }

  attachEventListeners() {
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        this.setTheme(theme);
      });
    });

    // Mode toggle
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        this.toggleMode();
      });
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('whatsapp-theme', theme);
    this.updateActiveButtons();
    this.showToast(`Theme changed to ${this.getThemeName(theme)}`, 'success');
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'dark' ? 'light' : 'dark';
    this.applyMode(this.currentMode);
    localStorage.setItem('whatsapp-mode', this.currentMode);
  }

  applyMode(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      const modeToggle = document.getElementById('modeToggle');
      if (modeToggle) modeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('light-mode');
      const modeToggle = document.getElementById('modeToggle');
      if (modeToggle) modeToggle.textContent = '🌙';
    }
  }

  updateActiveButtons() {
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.theme === this.currentTheme) {
        btn.classList.add('active');
      }
    });
  }

  getThemeName(theme) {
    const names = {
      default: 'Ocean Blue',
      sunset: 'Sunset',
      forest: 'Forest',
      ocean: 'Deep Ocean',
      purple: 'Purple Dream',
      rose: 'Rose Gold'
    };
    return names[theme] || theme;
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
        <button class="toast-close">&times;</button>
      </div>
    `;

    const container = document.getElementById('toastContainer') || this.createToastContainer();
    container.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto hide
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
}

export default ThemeManager;