// src/components/Tabs/TabNavigation.tsx
import React from 'react';
import './TabNavigation.css'; // Tạo file này và copy/adapt CSS từ css/components/tabs.css

interface TabInfo {
  id: string;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  tabs: TabInfo[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
          data-tab={tab.id} // Giữ lại data-tab nếu CSS dùng nó
        >
          <i className={`fas ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </div>
  );
};