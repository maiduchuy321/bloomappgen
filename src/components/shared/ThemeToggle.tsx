// src/components/shared/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="theme-toggle">
      <i className="fas fa-sun"></i>
      <label className="switch">
        <input 
          type="checkbox" 
          id="theme-switch" 
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <span className="slider round"></span>
      </label>
      <i className="fas fa-moon"></i>
    </div>
  );
};