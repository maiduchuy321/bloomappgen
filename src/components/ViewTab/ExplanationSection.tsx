// src/components/ViewTab/ExplanationSection.tsx
import React, { useState } from 'react';
// Remove SyntaxHighlighter imports as ContentRenderer handles it
// import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// Remove escapeHtml import if used only by renderer
// import { escapeHtml } from '../../utils/formatters';
import { ContentRenderer } from '../shared/ContentRenderer'; // Import ContentRenderer
import './ExplanationSection.css';

interface ExplanationSectionProps {
  explanation?: any; // Use a more specific type if possible, e.g., Record<string, string> | { correct: string; [key: string]: string; }
  correctAnswerId?: string;
  isOpenInitially?: boolean;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  explanation,
  correctAnswerId,
  isOpenInitially = false
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  // Convert potential string explanation to the new object format if necessary for backward compatibility
  // Assuming explanation might sometimes just be a string, convert it to { correct: string }
  const processedExplanation = typeof explanation === 'string' && explanation.trim() !== ''
    ? { correct: explanation.trim() }
    : explanation;

  // If no processed explanation or explanation object is empty, don't display
  if (!processedExplanation || typeof processedExplanation !== 'object' || Object.keys(processedExplanation).length === 0) {
    return null;
  }

  // Get explanation for the correct answer
  const correctExplanation = processedExplanation.correct || '';
  const hasCorrectExplanation = correctExplanation.trim().length > 0;

  // Create object containing explanations for wrong answers
  const wrongAnswersObj: Record<string, string> = {};

  // Iterate through all keys in the explanation object
  Object.keys(processedExplanation).forEach(key => {
    // Include explanations for specific option IDs (A, B, C, ...)
    // and exclude 'correct' and the actual correctAnswerId
    if (key !== 'correct' && key !== correctAnswerId && processedExplanation[key] && processedExplanation[key].trim().length > 0) {
        // Basic check if key looks like an option ID (A, B, C...)
        if (/^[A-Z]$/.test(key)) {
             wrongAnswersObj[key] = processedExplanation[key];
        }
        // You might need a more robust check here depending on your data structure
        // For example, check if this key exists in question.options (if question prop was passed down)
    }
  });

  // Sort wrong answer keys alphabetically (A, B, C...)
  const sortedWrongAnswerKeys = Object.keys(wrongAnswersObj).sort();

  const hasWrongExplanations = sortedWrongAnswerKeys.length > 0;

  // If no explanations at all, don't render the section
  if (!hasCorrectExplanation && !hasWrongExplanations) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Use ContentRenderer for rendering the text content

  return (
    // Add card-section class for consistent padding
    <div className="card-section explanation-section">
      <button
        className={`explanation-toggle-btn ${isOpen ? 'is-open' : ''}`} // Add class for open state
        onClick={handleToggle}
        aria-expanded={isOpen} // Accessibility
        aria-controls="explanation-content" // Accessibility
      >
        <i className={`fas fa-lightbulb explanation-toggle-icon`}></i> {/* Icon with dedicated class */}
        <span>Xem giải thích chi tiết</span>
         {/* Add chevron icon */}
        <i className={`fas fa-chevron-down explanation-chevron-icon`}></i>
      </button>

      {/* Content area, toggle visibility based on isOpen */}
      {isOpen && (
        <div className="explanation-content" id="explanation-content"> {/* Add id for accessibility */}
          {/* Phần giải thích đáp án đúng */}
          {hasCorrectExplanation && (
            <div id="explanation-correct-answer" className="explanation-subsection">
              <h4><i className="fas fa-check-circle text-success"></i> Giải thích đáp án đúng</h4>
              <div className="explanation-area display-area"> {/* Use display-area + explanation-area */}
                <ContentRenderer text={correctExplanation} keyPrefix="correct-explanation" />
              </div>
            </div>
          )}

          {/* Phần giải thích các lựa chọn khác */}
          {hasWrongExplanations && (
            <div id="explanation-wrong-answers" className="explanation-subsection">
              <h4><i className="fas fa-times-circle text-danger"></i> Giải thích các lựa chọn khác</h4>
              <div className="explanation-area display-area"> {/* Use display-area + explanation-area */}
                {sortedWrongAnswerKeys.map(key => (
                  <div key={key} className="wrong-answer-item">
                    <div className="wrong-answer-label">
                        <strong>Giải thích cho {key}:</strong>
                    </div>
                    <div className="wrong-answer-text"> {/* Separate text content */}
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