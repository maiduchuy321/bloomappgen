// src/components/shared/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFirst?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onFirst = () => onPageChange(1),
  onPrev,
  onNext,
  onLast = () => onPageChange(totalPages),
  hasPrev,
  hasNext,
  className = ''
}) => {
  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className={`pagination ${className}`}>
      <button 
        className="pagination-btn" 
        onClick={onFirst} 
        disabled={!hasPrev}
      >
        <i className="fas fa-angle-double-left"></i>
      </button>
      <button 
        className="pagination-btn" 
        onClick={handlePrev} 
        disabled={!hasPrev}
      >
        <i className="fas fa-angle-left"></i>
      </button>
      <span className="page-info">
        Trang {currentPage}/{totalPages}
      </span>
      <button 
        className="pagination-btn" 
        onClick={handleNext} 
        disabled={!hasNext}
      >
        <i className="fas fa-angle-right"></i>
      </button>
      <button 
        className="pagination-btn" 
        onClick={onLast} 
        disabled={!hasNext}
      >
        <i className="fas fa-angle-double-right"></i>
      </button>
    </div>
  );
};