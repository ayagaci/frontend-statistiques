import React, { useState, useEffect } from 'react';

const themes = {
  light: {
    '--bg-color': '#ffffff',
    '--text-color': '#000000',
    '--accent-color': '#007bff'
  },
  dark: {
    '--bg-color': '#1a1a1a',
    '--text-color': '#ffffff',
    '--accent-color': '#ff9800'
  },
  blue: {
    '--bg-color': '#e0f7fa',
    '--text-color': '#01579b',
    '--accent-color': '#0288d1'
  },
  modern: {
    '--bg-color': '#f5f5f5',
    '--text-color': '#333333',
    '--accent-color': '#6200ea'
  }
};

const ThemeSelector = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');

    const selectedTheme = themes[theme];
    for (let key in selectedTheme) {
      root.style.setProperty(key, selectedTheme[key]);
    }

    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 500);

    return () => clearTimeout(timeout);
  }, [theme]);

  return (
    <div className="theme-selector">
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">🌞 Clair</option>
        <option value="blue">🔵 Bleu clair</option>
        <option value="dark">🌙 Sombre</option>
        <option value="modern">🧊 Moderne</option>
      </select>
    </div>
  );
};

export default ThemeSelector;