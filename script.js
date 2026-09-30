const themeToggle = document.querySelector('#theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.documentElement.classList.add('light');

function updateThemeButton() {
  if (!themeToggle) return;
  const light = document.documentElement.classList.contains('light');
  themeToggle.textContent = light ? '🌙 Dark' : '☀️ Light';
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
    updateThemeButton();
  });
}
updateThemeButton();
