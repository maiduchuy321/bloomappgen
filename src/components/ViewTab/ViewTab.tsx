// src/components/ViewTab/ViewTab.tsx
import React from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import { QuestionControls } from './QuestionControls';
import { QuestionCard } from './QuestionCard';
import './ViewTab.css'; // CSS riêng


const ViewTab: React.FC = () => {
  const { currentQuestion, filteredQuestions, isLoading, error } = useQuestions();

  return (
    <div className="tab-content active" id="view-tab">
      <QuestionControls />
      {/* Loading dữ liệu */}
      {isLoading && (
         <div className="loading-message card-like"> {/* Use card-like for consistent visual */ }
            {/* <LoadingIcon className="status-icon" /> Add an icon/illustration */}
            <i className="fas fa-spinner fa-spin status-icon text-primary"></i> {/* Example spinner icon */}
            <p>Đang tải câu hỏi...</p>
         </div>
      )}
      {/* Lỗi khi tải dữ liệu */}
      {error && (
        <div className="error-message card-like"> {/* Use card-like */}
           {/* <ErrorIcon className="status-icon" /> Add an icon/illustration */}
           <i className="fas fa-exclamation-triangle status-icon text-danger"></i> {/* Example error icon */}
           <p>Lỗi: {error}</p>
        </div>
      )}
      {/* Không có câu hỏi nào khớp với bộ lọc hiện tại */}
      {!isLoading && !error && filteredQuestions.length === 0 && (
        <div className="empty-state card-like"> {/* Use card-like */}
            {/* <NoQuestionsIcon className="status-icon" /> Add an icon/illustration */}
            <i className="fas fa-box-open status-icon text-neutral-400"></i> {/* Example empty icon */}
            <p>Không có câu hỏi nào khớp với bộ lọc hiện tại.</p>
            {/* <p className="mt-sm">Vui lòng kiểm tra tab "Cấu Hình" để tải dữ liệu.</p> Add hint */}
        </div>
      )}
      {/* Nếu có câu hỏi đã được chọn, hiển thị nó */}
       {/* This state is less likely if filterQuestions works correctly, but keep for robustness */}
      {!isLoading && !error && filteredQuestions.length > 0 && !currentQuestion && (
         <div className="empty-state card-like"> {/* Use card-like */}
            {/* <NoQuestionsIcon className="status-icon" /> */}
            <i className="fas fa-filter status-icon text-neutral-400"></i> {/* Example icon */}
            <p>Đã tải dữ liệu, nhưng không có câu hỏi nào khớp với bộ lọc hiện tại.</p>
        </div>
      )}
      {/* Nếu có câu hỏi đã được chọn, hiển thị nó */}
      {!isLoading && !error && currentQuestion && (
        <QuestionCard question={currentQuestion} />
      )}
    </div>
  );
};

export default ViewTab;