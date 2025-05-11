// src/components/ConfigTab/ConfigTab.tsx
import React from 'react';
import ConfigForm from './ConfigForm';
import './ConfigTab.css'; // Giả sử file CSS này tồn tại

const ConfigTab: React.FC = () => {
  return (
    <div className="tab-content active" id="config-tab">
      <ConfigForm />
    </div>
  );
};

export default ConfigTab;