import React, { useEffect, useState } from 'react';

const themes = {
  light: {
    '--bg-color': '#ffffff',
    '--text-color': '#000000',
  },
  blue: {
    '--bg-color': '#e6f0ff',
    '--text-color': '#003366',
  },
  dark: {
    '--bg-color': '#1e1e1e',
    '--text-color': '#f0f0f0',
  },
  modern: {
    '--bg-color': '#f4f4f9',
    '--text-color': '#333',
  },
};

export default function ThemeSelector() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themes[theme];
    for (let key in selectedTheme) {
      root.style.setProperty(key, selectedTheme[key]);
    }
  }, [theme]);

  return (
    <div style={{ position: 'absolute', top: 10, right: 10 }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Clair</option>
        <option value="blue">Bleu clair</option>
        <option value="dark">Sombre</option>
        <option value="modern">Moderne</option>
      </select>
    </div>
  );
}