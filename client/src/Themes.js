// Применение темы для всего приложения через CSS custom properties

export function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.style.setProperty("--bg-main", "#181f2a");
    document.documentElement.style.setProperty("--bg-panel", "#232c3b");
    document.documentElement.style.setProperty("--bg-light", "#2d3140");
    document.documentElement.style.setProperty("--text-main", "#fff");
    document.documentElement.style.setProperty("--text-secondary", "#bdbdbd");
    document.documentElement.style.setProperty("--accent", "#8c55aa");
    document.documentElement.style.setProperty("--border", "#181f2a");
    document.documentElement.style.setProperty("--button-bg", "#232c3b");
    document.documentElement.style.setProperty("--button-hover", "#8c55aa");
  } else {
    // Фиолетовая (светлая) тема
    document.documentElement.style.setProperty("--bg-main", "#f3ebf6");
    document.documentElement.style.setProperty("--bg-panel", "#fff");
    document.documentElement.style.setProperty("--bg-light", "#f3ebf6");
    document.documentElement.style.setProperty("--text-main", "#8c55aa");
    document.documentElement.style.setProperty("--text-secondary", "#232c3b");
    document.documentElement.style.setProperty("--accent", "#8c55aa");
    document.documentElement.style.setProperty("--border", "#b97cff");
    document.documentElement.style.setProperty("--button-bg", "#f3ebf6");
    document.documentElement.style.setProperty("--button-hover", "#e1cfff");
  }
}

// Автоматически применяем тему при загрузке
export function initTheme() {
  const theme = localStorage.getItem("theme") || "default";
  applyTheme(theme);
}