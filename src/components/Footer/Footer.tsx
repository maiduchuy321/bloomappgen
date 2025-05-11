// src/components/Footer/Footer.tsx
import React from 'react';
import './Footer.css'; // Tạo file này và copy CSS từ css/layout/footer.css

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>© {new Date().getFullYear()} Bloom Question Manager</p>
      </div>
    </footer>
  );
};