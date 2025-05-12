// src/components/Header/Header.tsx
import React from 'react';
import { ThemeToggle } from '../shared/ThemeToggle';
import './Header.css'; // Tạo file này và copy CSS từ css/layout/header.css

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container">
        <h1 className='text-3xl'><i className="fas fa-brain"></i> Quản lý Câu Hỏi Bloom</h1>
        <ThemeToggle />
      </div>
    </header>
  );
};