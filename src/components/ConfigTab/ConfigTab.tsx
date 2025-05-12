import React from 'react';
import ConfigForm from './ConfigForm';
import './ConfigTab.css'; // Giả sử file CSS này tồn tại

interface ConfigTabProps {
  setActiveTab?: (tabId: 'view' | 'config' | 'list') => void;
}

const ConfigTab: React.FC<ConfigTabProps> = ({ setActiveTab }) => {
  return (
    <div className="tab-content active" id="config-tab">
      <ConfigForm setActiveTab={setActiveTab} />
    </div>
  );
};

export default ConfigTab;