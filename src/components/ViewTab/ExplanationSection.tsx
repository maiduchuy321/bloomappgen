// src/components/ViewTab/ExplanationSection.tsx
import React, { useState } from 'react';
import { ContentRenderer } from '../shared/ContentRenderer';
import './ExplanationSection.css';

interface ExplanationSectionProps {
  explanation?: any; // Record<string, string> | { correct: string; [key: string]: string; }
  correctAnswerId?: string;
  isOpenInitially?: boolean;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  explanation,
  correctAnswerId,
  isOpenInitially = false
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  // Xử lý dữ liệu giải thích
  const processedExplanation = typeof explanation === 'string' && explanation.trim() !== ''
    ? { correct: explanation.trim() }
    : explanation;

  // Kiểm tra dữ liệu hợp lệ
  if (!processedExplanation || typeof processedExplanation !== 'object' || Object.keys(processedExplanation).length === 0) {
    return null;
  }

  // Lấy giải thích cho đáp án đúng
  const correctExplanation = processedExplanation.correct || '';
  const hasCorrectExplanation = correctExplanation.trim().length > 0;

  // Tạo object chứa giải thích cho các đáp án sai
  const wrongAnswersObj: Record<string, string> = {};

  // Lọc các giải thích cho đáp án sai
  Object.keys(processedExplanation).forEach(key => {
    if (key !== 'correct' && key !== correctAnswerId && processedExplanation[key] && processedExplanation[key].trim().length > 0) {
      if (/^[A-Z]$/.test(key)) {
        wrongAnswersObj[key] = processedExplanation[key];
      }
    }
  });

  // Sắp xếp các đáp án sai theo thứ tự A, B, C...
  const sortedWrongAnswerKeys = Object.keys(wrongAnswersObj).sort();
  const hasWrongExplanations = sortedWrongAnswerKeys.length > 0;

  // Không hiển thị gì nếu không có giải thích
  if (!hasCorrectExplanation && !hasWrongExplanations) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="card-section explanation-container">
      <button
        className={`explanation-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="explanation-content"
      >
        <div className="explanation-toggle-left">
          <div className="explanation-icon-wrapper">
            <i className="fas fa-lightbulb"></i>
          </div>
          <span>Xem giải thích chi tiết</span>
        </div>
        <div className="explanation-toggle-right">
          <div className={`chevron-icon ${isOpen ? 'rotated' : ''}`}>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </button>

      {isOpen && (
        <div 
          className="explanation-content" 
          id="explanation-content"
        >
          {hasCorrectExplanation && (
            <div className="explanation-block correct-explanation">
              <div className="explanation-header">
                <div className="icon-circle correct">
                  <i className="fas fa-check"></i>
                </div>
                <h4>Giải thích đáp án đúng</h4>
              </div>
              <div className="explanation-body">
                <ContentRenderer text={correctExplanation} keyPrefix="correct-explanation" />
              </div>
            </div>
          )}

          {hasWrongExplanations && (
            <div className="explanation-block wrong-explanations">
              <div className="explanation-header">
                <div className="icon-circle wrong">
                  <i className="fas fa-times"></i>
                </div>
                <h4>Giải thích các lựa chọn khác</h4>
              </div>
              <div className="explanation-body">
                {sortedWrongAnswerKeys.map((key, index) => (
                  <div key={key} className="wrong-answer-item">
                    <div className="wrong-answer-badge">{key}</div>
                    <div className="wrong-answer-content">
                      <ContentRenderer text={wrongAnswersObj[key]} keyPrefix={`wrong-explanation-${key}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};