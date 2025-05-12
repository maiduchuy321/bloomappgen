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
  
  // Use nullish coalescing to provide a default value (0) if rating is undefined
  const currentRating = question.rating ?? 0;
  
  return (
    <div className="question-metadata">
      <div className="metadata-item">
        <span className="metadata-label">Đáp án đúng:</span>{' '}
        <span className="metadata-value">
          {question.options && question.options.find(opt => opt.id === question.correctAnswerId)?.id || 'N/A'}
        </span>
      </div>
      
      {(question.tokensInput !== undefined || question.tokensOutput !== undefined) && (
        <div className="metadata-item">
          {question.tokensInput !== undefined && (
            <span className="metadata-value">
              Tokens Input: {question.tokensInput}
            </span>
          )}
          {question.tokensOutput !== undefined && (
            <span className="metadata-value">
              Tokens Output: {question.tokensOutput}
            </span>
          )}
        </div>
      )}
      
      <div className="metadata-item">
        <span className="metadata-label">Đánh giá câu hỏi:</span>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((rating) => (
            <span
              key={rating}
              className={`rating-star ${currentRating >= rating ? 'active' : ''} ${hoverRating != null && hoverRating >= rating ? 'hover' : ''}`}
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => setHoverRating(rating)}
              onMouseLeave={() => setHoverRating(null)}
              title={getRatingLabel(rating)}
            >
              <Heart
                fill={currentRating >= rating || (hoverRating != null && hoverRating >= rating) ? "#ff5757" : "none"}
                color={currentRating >= rating || (hoverRating != null && hoverRating >= rating) ? "#ff5757" : "#666"}
              />
            </span>
          ))}
        </div>
        <span className="rating-label">{getRatingLabel(currentRating)}</span>
      </div>
      
      <Button onClick={onEditClick} className="edit-button">
        Chỉnh sửa
      </Button>
    </div>
  );
};