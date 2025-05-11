// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface PaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export const usePagination = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1
}: PaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );
  
  // Đảm bảo currentPage hợp lệ khi totalPages thay đổi
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
  
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  
  const nextPage = () => {
    goToPage(currentPage + 1);
  };
  
  const prevPage = () => {
    goToPage(currentPage - 1);
  };
  
  const firstPage = () => {
    goToPage(1);
  };
  
  const lastPage = () => {
    goToPage(totalPages);
  };
  
  // Tính toán các mục hiển thị cho trang hiện tại
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return { startIndex, endIndex };
  }, [currentPage, itemsPerPage, totalItems]);
  
  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    paginatedItems,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages
  };
};