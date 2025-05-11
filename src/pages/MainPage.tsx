// src/pages/MainPage.tsx
import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { TabNavigation } from '../components/Tabs/TabNavigation';
import { useQuestions } from '../contexts/QuestionContext'; // Để load ví dụ nếu cần

// Lazy load tab components
const ViewTab = lazy(() => import('../components/ViewTab/ViewTab'));
const ConfigTab = lazy(() => import('../components/ConfigTab/ConfigTab'));
const ListTab = lazy(() => import('../components/ListTab/ListTab'));

// CSS cho layout chung của main page (nếu có, ví dụ: main-container)
// import './MainPage.css';

type TabId = 'view' | 'config' | 'list';

const TABS_CONFIG: { id: TabId; label: string; icon: string; component: React.FC<any> }[] = [
  { id: 'view', label: 'Xem Câu Hỏi', icon: 'fa-eye', component: ViewTab },
  { id: 'config', label: 'Cấu Hình', icon: 'fa-cog', component: ConfigTab },
  { id: 'list', label: 'Danh Sách', icon: 'fa-list', component: ListTab },
];

export const MainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('view'); // Tab mặc định
  const { loadExampleQuestions } = useQuestions(); // Lấy hàm tải ví dụ

  // // Ví dụ: Tải dữ liệu mẫu khi component mount lần đầu (nếu muốn)
  // // Tuy nhiên, trong JS gốc, việc này được xử lý bởi người dùng
  // useEffect(() => {
  //   // loadExampleQuestions().catch(err => console.error("Failed to load example questions on mount", err));
  // }, [loadExampleQuestions]);


  const ActiveTabComponent = TABS_CONFIG.find(tab => tab.id === activeTab)?.component;

  return (
    <>
      <Header />
      <div className="container main-container">
        <TabNavigation
          tabs={TABS_CONFIG.map(({ id, label, icon }) => ({ id, label, icon }))}
          activeTab={activeTab}
          onTabClick={(tabId) => setActiveTab(tabId as TabId)}
        />
        <div className="main-layout">
          <Suspense fallback={<div className="tab-content active"><p>Đang tải tab...</p></div>}>
            {ActiveTabComponent && <ActiveTabComponent setActiveTab={setActiveTab} />} {/* Truyền setActiveTab nếu ListTab cần chuyển tab */}
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
};