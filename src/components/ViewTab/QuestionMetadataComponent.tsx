// src/components/question/QuestionMetadataComponent.tsx
import React, { useState } from 'react';
import { type Question, getRatingLabel } from '../../models/Question';
import { Button } from '../shared/Button';
import { Heart } from 'lucide-react';
import './QuestionMetadataComponent.css';

interface QuestionMetadataProps {
  question: Question;
  onEditClick: () => void;
  onRatingChange: (questionId: string, rating: number) => void;
}

export const QuestionMetadataComponent: React.FC<QuestionMetadataProps> = ({ 
  question, 
  onEditClick, 
  onRatingChange 
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    onRatingChange(question.id, rating);
  };

  return (
    <div className="question-metadata">
      <div className="metadata-info">
        <p className="correct-answer-display">
          <i className="fas fa-check-circle"></i> <strong>Đáp án đúng:</strong>{' '}
          <span className="correct-answer">
            {question.options && question.options.find(opt => opt.id === question.correctAnswerId)?.id || 'N/A'}
          </span>
        </p>
        
        {(question.tokensInput !== undefined || question.tokensOutput !== undefined) && (
          <div className="token-info">
            {question.tokensInput !== undefined && (
              <span title="Tokens Input" className="token-input">
                <i className="fas fa-arrow-down"></i> {question.tokensInput}
              </span>
            )}
            {question.tokensOutput !== undefined && (
              <span title="Tokens Output" className="token-output">
                <i className="fas fa-arrow-up"></i> {question.tokensOutput}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="question-actions">
        <div className="rating-stars">
          <span className="rating-label">Đánh giá câu hỏi:</span>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((rating) => (
              <span 
                key={rating}
                className={`rating-star ${question.rating >= rating ? 'active' : ''} ${hoverRating != null && hoverRating >= rating ? 'hover' : ''}`}
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoverRating(rating)}
                onMouseLeave={() => setHoverRating(null)}
                title={getRatingLabel(rating)}
              >
                <Heart 
                  size={20} 
                  fill={question.rating >= rating || (hoverRating != null && hoverRating >= rating) ? "#ff5757" : "none"} 
                  color={question.rating >= rating || (hoverRating != null && hoverRating >= rating) ? "#ff5757" : "#666"}
                />
              </span>
            ))}
          </div>
          <span className="rating-text">{getRatingLabel(question.rating)}</span>
        </div>
        
        <Button className="btn-edit" onClick={onEditClick}>
          <i className="fas fa-edit"></i> Chỉnh sửa
        </Button>
      </div>
    </div>
  );
};