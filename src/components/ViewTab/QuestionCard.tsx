// src/components/question/QuestionCard.tsx
import React, { useState } from "react";
import type { Question, QuestionOption } from "../../models/Question";
import { useQuestions } from "../../contexts/question/QuestionContext";
import { ExplanationSection } from "./ExplanationSection";
import { EditQuestionModal } from "../shared/editQuestion/EditQuestionModal";
import { ContentRenderer } from "../shared/ContentRenderer";
import { escapeHtml } from "../../utils/formatters";
import "./QuestionCard.css";

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { updateQuestion, rateQuestion } = useQuestions();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(question.rating || 0);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveChanges = (updatedQuestion: Question) => {
    if (updateQuestion) {
      updateQuestion(updatedQuestion.id, updatedQuestion);
    }
    setIsEditModalOpen(false);
  };

  const handleRatingChange = (newRating: number) => {
    if (rateQuestion) {
      rateQuestion(question.id, newRating);
      setRating(newRating);
    }
  };

  // Hàm helper để xác định class CSS cho Bloom tag
  const getBloomTagClass = (bloomLevel) => {
    const level = bloomLevel.toLowerCase();
    if (level.includes("remember")) return "bloom-tag-remember";
    if (level.includes("understand")) return "bloom-tag-understand";
    if (level.includes("apply")) return "bloom-tag-apply";
    if (level.includes("analyze")) return "bloom-tag-analyze";
    if (level.includes("evaluate")) return "bloom-tag-evaluate";
    if (level.includes("create")) return "bloom-tag-create";
    return "bloom-tag"; // Default class
  };

  // Hàm helper để xác định class CSS cho Question Type tag
  const getQTypeTagClass = (qType) => {
    const type = qType.toLowerCase();
    if (type.includes("multiple choice")) return "qtype-tag-multiple-choice";
    if (type.includes("true/false")) return "qtype-tag-true-false";
    if (type.includes("short answer")) return "qtype-tag-short-answer";
    if (type.includes("essay")) return "qtype-tag-essay";
    if (type.includes("problem")) return "qtype-tag-problem";
    return "qtype-tag"; // Default class
  };

  // Render star rating
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? "active" : ""}`}
          onClick={() => handleRatingChange(i)}
        >
          <i className="fas fa-star"></i>
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className={`question-card ${
        question.text.includes("```") ? "has-code-block" : ""
      }`}
    >
      <div className="question-header">
        <div className="card-infor">
          <div className="question-number-display">
            Câu hỏi
          <div
            className={`question-number-badge ${
              question.number.toString().length > 2 ? "large-number" : ""
            }`}
          >
            {question.number}
          </div>
        </div>
        <div className="question-tags">
          <span className={`tag ${getBloomTagClass(question.bloomLevel)}`}>
            Bloom: {question.bloomLevel}
          </span>
          <span className={`tag ${getQTypeTagClass(question.questionType)}`}>
            Loại: {question.questionType}
          </span>
        </div>
        </div>
        {question.context && (
        <div className="card-meta">
          {question.context.courseTitle && (
            <div className="card-meta-item">
              <i className="fas fa-book-open"></i>
              <p>{escapeHtml(question.context.courseTitle)}</p>
            </div>
          )}
          {question.context.moduleNumber && (
            <div className="card-meta-item">
              <i className="fas fa-puzzle-piece"></i>
              <p>
                Module {escapeHtml(question.context.moduleNumber.toString())}
              </p>
            </div>
          )}
          {question.context.topic && (
            <div className="card-meta-item">
              <i className="fas fa-tags"></i>
              <p>{escapeHtml(question.context.topic)}</p>
            </div>
          )}
        </div>
      )}
      </div>

      <div className="card-section">
        <h3>
          <i className="fas fa-question-circle"></i> Nội dung câu hỏi
        </h3>
        <div className="question-content">
          <ContentRenderer
            text={question.text}
            keyPrefix={`question-${question.id}-content`}
          />
        </div>
      </div>

      <div className="card-section">
        <h3>
          <i className="fas fa-list-ul"></i> Các lựa chọn
        </h3>
        <ul className="options-list">
          {question.options && question.options.length > 0 ? (
            question.options.map((option: QuestionOption) => (
              <li
                key={option.id}
                className={
                  option.id === question.correctAnswerId ? "correct-option" : ""
                }
              >
                <div className="option-text-content">
                  <ContentRenderer
                    text={option.text}
                    keyPrefix={`option-${option.id}`}
                  />
                </div>
              </li>
            ))
          ) : (
            <li className="empty-state">Không có lựa chọn.</li>
          )}
        </ul>
      </div>

      <ExplanationSection
        explanation={
          question.explanation ? question.explanation : { correct: "" }
        }
        correctAnswerId={question.correctAnswerId}
      />

      <div className="question-metadata">
        <div className="metadata-info">
          <div className="star-rating"><span>Đánh giá câu hỏi:</span> {renderStarRating()}</div>
        </div>
        <div className="metadata-actions">
          <button
            className="action-button edit-button"
            onClick={handleOpenEditModal}
          >
            <i className="fas fa-edit"></i> Chỉnh sửa
          </button>
        </div>
      </div>

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
