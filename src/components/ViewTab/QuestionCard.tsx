// src/components/question/QuestionCard.tsx
import React, { useState } from 'react';
import type { Question, QuestionOption } from '../../models/Question';
import { useQuestions } from '../../contexts/QuestionContext';
import { ExplanationSection } from './ExplanationSection';
import { EditQuestionModal } from './EditQuestionModal';
import { ContentRenderer } from '../shared/ContentRenderer';
import { QuestionMetadataComponent } from './QuestionMetadataComponent';
import { escapeHtml } from '../../utils/formatters';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  console.log('[QuestionCard] Received question prop:', JSON.parse(JSON.stringify(question)));

  const { updateQuestion, rateQuestion } = useQuestions(); // Sử dụng rateQuestion từ context

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = (updatedQuestion: Question) => {
    console.log('Saving changes:', updatedQuestion);
    if (updateQuestion) {
        updateQuestion(updatedQuestion.id, updatedQuestion);
    } else {
        console.warn("updateQuestion function is not available in QuestionContext");
    }
    setIsEditModalOpen(false);
  };

  // Hàm xử lý đánh giá câu hỏi
  const handleRatingChange = (questionId: string, rating: number) => {
    if (rateQuestion) {
      // Gọi hàm rateQuestion từ context
      rateQuestion(questionId, rating);
      console.log(`[QuestionCard] Đã đánh giá câu hỏi ID ${questionId} với rating ${rating}`);
    } else {
      console.warn("rateQuestion function is not available in QuestionContext");
    }
  };

  return (
    <div className={`question-card ${question.text.includes('```') ? 'has-code-block' : ''}`}>
      {question.context && (
        <div className="question-context-info card-section" id="q-context-info">
          {question.context.courseTitle && (
            <h4 className="context-course-title">
              <i className="fas fa-book-open"></i> Khóa học:{' '}
              <span>{escapeHtml(question.context.courseTitle)}</span>
            </h4>
          )}
          {question.context.courseDescription && (
            <p className="context-course-desc">{escapeHtml(question.context.courseDescription)}</p>
          )}
          {question.context.moduleNumber && (
            <p className="context-module-info">
              <i className="fas fa-puzzle-piece"></i> Module:{' '}
              <strong>{escapeHtml(question.context.moduleNumber.toString())}</strong>
            </p>
          )}
          {question.context.topic && (
            <p className="context-topic-info">
              <i className="fas fa-tags"></i> Chủ đề:{' '}
              <strong>{escapeHtml(question.context.topic)}</strong>
            </p>
          )}
        </div>
      )}

      <div className="question-header">
        <div className="question-number-display">
          Câu hỏi số: <span>{question.number}</span>
        </div>
        <div className="question-tags">
          <span className="tag bloom-tag">Bloom: {question.bloomLevel}</span>
          <span className="tag qtype-tag">Q-Type: {question.questionType}</span>
        </div>
      </div>

      <div className="card-section">
        <h3><i className="fas fa-question-circle"></i> Nội dung câu hỏi:</h3>
        <div className="question-content">
          <ContentRenderer text={question.text} keyPrefix={`question-${question.id}-content`} />
        </div>
      </div>

      <div className="card-section">
        <h3><i className="fas fa-list-ul"></i> Các lựa chọn:</h3>
        <ul className="options-list">
          {question.options && question.options.length > 0 ? (
            question.options.map((option: QuestionOption) => (
              <li
                key={option.id}
                className={option.id === question.correctAnswerId ? 'correct-option' : ''}
              >
                <div className="option-text-content">
                   <ContentRenderer text={option.text} keyPrefix={`option-${option.id}`} />
                </div>
              </li>
            ))
          ) : (
            <li className="empty-state">Không có lựa chọn.</li>
          )}
        </ul>
      </div>

      <ExplanationSection
        explanation={question.explanation ? question.explanation : { correct: '' }}
        correctAnswerId={question.correctAnswerId}
      />

      {/* Thay thế component metadata-display cũ bằng component mới */}
      <QuestionMetadataComponent
        question={question}
        onEditClick={handleOpenEditModal}
        onRatingChange={handleRatingChange}
      />

      {/* Render Modal */}
      {isEditModalOpen && (
        <EditQuestionModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          question={question}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};