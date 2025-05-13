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
    setUserConfig,
    deleteQuestionById,
    // filteredQuestions: contextFilteredQuestions // Dùng để tìm index khi xem chi tiết
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


  // const handleViewQuestion = useCallback((questionId: string) => {
  //   // Tìm index trong danh sách đã được filter bởi context (là nguồn chính cho ViewTab)
    
  //   const indexInContext = contextFilteredQuestions.findIndex(q => q.id === questionId);
  //   if (indexInContext !== -1) {
  //       goToQuestionInViewTab(indexInContext);
  //       setActiveTab('view'); // Chuyển sang tab Xem
  //   } else {
  //       // Nếu không tìm thấy trong contextFilteredQuestions (ví dụ filter ở ViewTab khác),
  //       // thử tìm trong allQuestions và áp dụng filter mới cho ViewTab
  //       const indexInAll = allQuestions.findIndex(q => q.id === questionId);
  //       if (indexInAll !== -1) {
  //           // Bạn có thể muốn reset filter của ViewTab ở đây hoặc thông báo người dùng
  //           // Hiện tại, chỉ chuyển đến câu hỏi đó trong `allQuestions` nếu ViewTab đang hiển thị `allQuestions` (ít filter)
  //           // Hoặc, logic tốt hơn là cập nhật `userConfig` để ViewTab filter đúng câu hỏi đó
  //           console.warn(`Câu hỏi ${questionId} không nằm trong bộ lọc hiện tại của ViewTab. Chuyển đến câu hỏi trong danh sách đầy đủ (nếu có).`);
  //           goToQuestionInViewTab(indexInAll); // Chuyển đến index trong allQuestions (cần ViewTab hỗ trợ)
  //                                              // Hoặc không làm gì nếu ViewTab không thể hiển thị trực tiếp từ allQuestions
  //           setActiveTab('view');
  //       } else {
  //           alert("Lỗi: Không tìm thấy câu hỏi.");
  //       }
  //   }
  // }, [contextFilteredQuestions, allQuestions, goToQuestionInViewTab, setActiveTab]);
  const handleViewQuestion = useCallback((questionId: string) => {
    // Tìm index trong danh sách đã được filter bởi context (là nguồn chính cho ViewTab)
    console.log('[ListTab handleViewQuestion] View question ID:', questionId);
    const questionToView = allQuestions?.find(q => q.id === questionId);
    // const indexInContext = contextFilteredQuestions.findIndex(q => q.id === questionId);
    if (questionToView) {
      // 1. Reset bộ lọc của ViewTab (userConfig trong context)
      // Điều này sẽ đảm bảo câu hỏi có thể được hiển thị.
      // Bạn có thể reset hoàn toàn hoặc chỉ reset các phần cần thiết.
      // Reset hoàn toàn:
      console.log('[ListTab handleViewQuestion] Resetting userConfig for ViewTab');
      setUserConfig({
        bloomLevel: '', // Reset Bloom
        questionType: '', // Reset Q-Type
        // Giữ lại numQuestions nếu bạn muốn: numQuestions: userConfig.numQuestions (cần lấy userConfig từ context)
      });// 2. Tìm index của câu hỏi trong danh sách allQuestions (vì filter đã được reset)
      // Sau khi setUserConfig, context sẽ re-render, allQuestions sẽ được lọc lại
      // Tuy nhiên, để đảm bảo goToQuestionInViewTab nhận đúng index *sau khi* state context cập nhật,
      // có thể cần một chút khéo léo hoặc chấp nhận rằng ViewTab sẽ tự tìm câu hỏi đầu tiên.
      // Cách đơn giản hơn: dựa vào việc ViewTab sẽ tự động hiển thị câu hỏi đầu tiên
      // sau khi filter được reset và danh sách filteredQuestions của context thay đổi.
      // Hoặc, chúng ta có thể dựa vào cơ chế của ViewTab để tìm đúng câu hỏi sau khi filter reset.

      // Để đảm bảo câu hỏi ĐÚNG được chọn sau khi reset filter:
      // Ta cần đợi state context cập nhật sau setUserConfig.
      // Một cách là sử dụng setTimeout 0 để đẩy việc tìm index và goToQuestion vào chu kỳ render tiếp theo.
      // Hoặc, cách tốt hơn là truyền ID câu hỏi và để ViewTab tự xử lý việc chọn nó sau khi filter.
      // Hiện tại, goToQuestionInViewTab nhận index.

      // CÁCH TIẾP CẬN 1: Đơn giản là reset filter và để ViewTab tự hiển thị.
      // ViewTab sẽ hiển thị currentQuestion, và currentQuestionIndex sẽ là 0 sau khi reset.
      // Nếu muốn nó trỏ đúng đến câu hỏi vừa click, cần phức tạp hơn.

      // CÁCH TIẾP CẬN 2: Reset filter và cố gắng điều hướng đến đúng câu hỏi.
      // Điều này có thể không hoạt động ngay lập tức vì setUserConfig là bất đồng bộ
      // và `allQuestions` hoặc `contextFilteredQuestions` chưa cập nhật ngay.

      // Giải pháp thực tế hơn:
      // Trong QuestionProvider, khi SET_USER_CONFIG, nếu có một "targetQuestionIdToSelectAfterFilter",
      // thì sau khi tính newFiltered, tìm index của targetId và set currentQuestionIndex.
      // Hoặc, ViewTab có thể nhận một prop `targetQuestionId` và tự xử lý trong useEffect.

      // TẠM THỜI, GIẢI PHÁP ĐƠN GIẢN HÓA:
      // Reset filter, sau đó tìm index trong allQuestions (vì lúc này filteredQuestions của context sẽ gần như là allQuestions)
      // và chuyển đến đó. ViewTab sẽ cập nhật khi context thay đổi.
      const indexInAll = allQuestions.findIndex(q => q.id === questionId);
      if (indexInAll !== -1) {
        console.log(`[ListTab handleViewQuestion] Found question in allQuestions at index: ${indexInAll}. Navigating.`);
        goToQuestionInViewTab(indexInAll);
        setActiveTab('view');
      } else {
        // Trường hợp này không nên xảy ra nếu questionToView được tìm thấy
        alert("Lỗi: Không tìm thấy câu hỏi trong danh sách đầy đủ sau khi reset filter.");
      }

    } else {
      alert("Lỗi: Không tìm thấy câu hỏi để xem.");
    }
  }, [allQuestions, goToQuestionInViewTab, setActiveTab, setUserConfig]);

  const handleDeleteQuestion = useCallback((questionId: string, questionTextSnippet: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi "${questionTextSnippet}" (ID: ${questionId}) không?`)) {
      try {
        deleteQuestionById(questionId);
        alert(`Đã xóa câu hỏi ID ${questionId}.`);
        // Pagination sẽ tự cập nhật do locallyFilteredQuestions thay đổi
      } catch (error) {
        alert(`Lỗi: Không thể xóa câu hỏi ID ${questionId}.`);
      }
    }
  }, [deleteQuestionById]);

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