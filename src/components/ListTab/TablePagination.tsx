// src/components/ListTab/TablePagination.tsx
import React from 'react';
import { Pagination as SharedPagination } from '../shared/Pagination'; // Import SharedPagination
import type { PaginationProps as SharedPaginationProps } from '../shared/Pagination'; // Lấy type của props

interface TablePaginationProps extends SharedPaginationProps {}

export const TablePagination: React.FC<TablePaginationProps> = (props) => {
  return (
    <div className="table-pagination">
      <SharedPagination {...props} />
    </div>
  );
};