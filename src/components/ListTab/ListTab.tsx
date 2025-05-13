// src/components/ListTab/ListTab.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuestions } from '../../contexts/question/QuestionContext';
import { usePagination } from '../../hooks/usePagination'; // Hook bạn đã tạo
import { QuestionTable } from './QuestionTable';
import { TablePagination } from './TablePagination';
import './ListTab.css'; // CSS riêng

const ITEMS_PER_PAGE = 10;

interface ListTabProps {
  setActiveTab: (tabId: 'view' | 'config' | 'list') => void; // Để chuyển tab
}

const ListTab: React.FC<ListTabProps> = ({ setActiveTab }) => {
  const {
    allQuestions, // Sử dụng allQuestions để filter cục bộ cho ListTab
    isLoading,
    error,
    goToQuestion: goToQuestionInViewTab, // Đổi tên để rõ ràng
    // deleteQuestionById,
    filteredQuestions: contextFilteredQuestions // Dùng để tìm index khi xem chi tiết
  } = useQuestions();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchTerm]);


  const locallyFilteredQuestions = useMemo(() => {
    if (!debouncedSearchTerm.trim() && !allQuestions) { // Thêm kiểm tra allQuestions
      return allQuestions || [];
    }
    if (!allQuestions) return []; // Trả về mảng rỗng nếu allQuestions là undefined

    const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
    return allQuestions.filter(q =>
      (q.text || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.bloomLevel || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.questionType || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.id || '').toString().toLowerCase().includes(lowerSearchTerm) ||
      (q.context?.courseTitle || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.context?.courseDescription || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.context?.moduleNumber || '').toLowerCase().includes(lowerSearchTerm) ||
      (q.context?.topic || '').toLowerCase().includes(lowerSearchTerm)
    );
  }, [allQuestions, debouncedSearchTerm]);


  const {
    currentPage,
    totalPages,
    goToPage,
    paginatedItems, // { startIndex, endIndex }
    hasPrev,
    hasNext,
  } = usePagination({
    totalItems: locallyFilteredQuestions.length,
    itemsPerPage: ITEMS_PER_PAGE,
    initialPage: 1
  });

  // Reset về trang 1 nếu filter thay đổi và trang hiện tại không còn hợp lệ
  useEffect(() => {
    if (locallyFilteredQuestions.length > 0 && currentPage > Math.ceil(locallyFilteredQuestions.length / ITEMS_PER_PAGE)) {
        goToPage(1);
    } else if (currentPage === 0 && totalPages > 0) { // Nếu từ 0 item lên có item
        goToPage(1);
    }
  }, [locallyFilteredQuestions.length, currentPage, totalPages, goToPage]);


  const currentTableItems = useMemo(() => {
    return locallyFilteredQuestions.slice(paginatedItems.startIndex, paginatedItems.endIndex);
  }, [locallyFilteredQuestions, paginatedItems]);


  const handleViewQuestion = useCallback((questionId: string) => {
    // Tìm index trong danh sách đã được filter bởi context (là nguồn chính cho ViewTab)
    const indexInContext = contextFilteredQuestions.findIndex(q => q.id === questionId);
    if (indexInContext !== -1) {
        goToQuestionInViewTab(indexInContext);
        setActiveTab('view'); // Chuyển sang tab Xem
    } else {
        // Nếu không tìm thấy trong contextFilteredQuestions (ví dụ filter ở ViewTab khác),
        // thử tìm trong allQuestions và áp dụng filter mới cho ViewTab
        const indexInAll = allQuestions.findIndex(q => q.id === questionId);
        if (indexInAll !== -1) {
            // Bạn có thể muốn reset filter của ViewTab ở đây hoặc thông báo người dùng
            // Hiện tại, chỉ chuyển đến câu hỏi đó trong `allQuestions` nếu ViewTab đang hiển thị `allQuestions` (ít filter)
            // Hoặc, logic tốt hơn là cập nhật `userConfig` để ViewTab filter đúng câu hỏi đó
            console.warn(`Câu hỏi ${questionId} không nằm trong bộ lọc hiện tại của ViewTab. Chuyển đến câu hỏi trong danh sách đầy đủ (nếu có).`);
            goToQuestionInViewTab(indexInAll); // Chuyển đến index trong allQuestions (cần ViewTab hỗ trợ)
                                               // Hoặc không làm gì nếu ViewTab không thể hiển thị trực tiếp từ allQuestions
            setActiveTab('view');
        } else {
            alert("Lỗi: Không tìm thấy câu hỏi.");
        }
    }
  }, [contextFilteredQuestions, allQuestions, goToQuestionInViewTab, setActiveTab]);


  // const handleDeleteQuestion = useCallback((questionId: string, questionTextSnippet: string) => {
  //   if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${questionTextSnippet}" (ID: ${questionId}) không?`)) {
  //     const success = deleteQuestionById(questionId);
  //     if (success) {
  //       alert(`Đã xóa câu hỏi ID ${questionId}.`);
  //       // Pagination sẽ tự cập nhật do locallyFilteredQuestions thay đổi
  //     } else {
  //       alert(`Lỗi: Không thể xóa câu hỏi ID ${questionId}.`);
  //     }
  //   }
  // }, [deleteQuestionById]);

  return (
    <div className="tab-content active" id="list-tab">
      <div className="list-card">
        <div className="list-header">
          <h2><i className="fas fa-th-list"></i> Danh sách câu hỏi</h2>
          <div className="search-box">
            <input
              type="text"
              id="search-questions"
              placeholder="Tìm kiếm câu hỏi, bloom, q-type, ID, khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>

        {isLoading && <div className="loading-message card-loading"><p>Đang tải danh sách...</p></div>}
        {error && <div className="error-message"><p>Lỗi: {error}</p></div>}
        {!isLoading && !error && (
          <>
            <QuestionTable
              questions={currentTableItems}
              onViewQuestion={handleViewQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              pageStartIndex={paginatedItems.startIndex}
            />
            {locallyFilteredQuestions.length > 0 && totalPages > 1 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                hasPrev={hasPrev}
                hasNext={hasNext}
                // onFirst, onLast, onPrev, onNext sẽ được xử lý bởi usePagination
              />
            )}
            {locallyFilteredQuestions.length === 0 && debouncedSearchTerm && (
                <p className="empty-table" style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy câu hỏi nào với từ khóa "{debouncedSearchTerm}".</p>
            )}
            {locallyFilteredQuestions.length === 0 && !debouncedSearchTerm && (
                <p className="empty-table" style={{textAlign: 'center', padding: '20px'}}>Không có câu hỏi nào. Hãy thử tải dữ liệu ở tab "Cấu Hình".</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default ListTab;