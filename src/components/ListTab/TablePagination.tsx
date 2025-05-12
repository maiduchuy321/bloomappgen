// src/components/ListTab/TablePagination.tsx
import React from 'react';
import { Pagination as SharedPagination } from '../shared/Pagination';

// Định nghĩa lại interface PaginationProps dựa trên props của component Pagination
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

interface TablePaginationProps extends PaginationProps {}

export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  return (
    <div className="table-pagination">
      <SharedPagination {...props} />
    </div>
  );
};