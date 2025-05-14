// src/components/question/EditQuestionModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Question, QuestionOption } from '../../../models/Question';
import { BloomLevel, bloomLevelLabels } from '../../../models/BloomLevel';
import { questionTypesByBloom, type QuestionType as AppQuestionType } from '../../../models/QuestionType'; // Model QuestionType
import { Button } from '../Button';
import { v4 as uuidv4 } from 'uuid';
import { ContentRenderer } from '../ContentRenderer'; 
import './EditQuestionModal.css';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null; // Cho phép null
  onSave: (updatedQuestion: Question) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question: initialQuestion,
  onSave
}) => {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const [originalQuestion, setOriginalQuestion] = useState<Question | null>(null); // Lưu trữ dữ liệu gốc để so sánh
  const [newOptionText, setNewOptionText] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (isOpen && initialQuestion) {
      console.log('[EditQuestionModal useEffect] Initializing/Resetting form with question:', JSON.parse(JSON.stringify(initialQuestion)));
      const questionCopy = JSON.parse(JSON.stringify(initialQuestion)); // Deep clone
      console.log('[EditQuestionModal useEffect] questionCopy form with question:', questionCopy);

      // Ensure all required nested objects and arrays exist
      if (!questionCopy.context) {
        questionCopy.context = { courseTitle: '', courseDescription: '', moduleNumber: '', topic: '' };
      }
      if (!questionCopy.explanation) {
        questionCopy.explanation = { correct: '', A: '', B: '', C: '', D: '' };
      } else {
        // Đảm bảo rằng tất cả các trường giải thích tồn tại
        questionCopy.explanation = {
          correct: questionCopy.explanation.correct || '',
          A: questionCopy.explanation.A || '',
          B: questionCopy.explanation.B || '',
          C: questionCopy.explanation.C || '',
          D: questionCopy.explanation.D || '',
        };
      }
      if (!Array.isArray(questionCopy.options)) {
        questionCopy.options = [];
      }
      if (!Array.isArray(questionCopy.tags)) {
        questionCopy.tags = [];
      }

      setEditedQuestion(questionCopy);
      // Lưu trữ bản sao của dữ liệu gốc để so sánh khi lưu
      setOriginalQuestion(JSON.parse(JSON.stringify(questionCopy)));
      setActiveTab('basic');
      setPreviewMode(false);
      setFormErrors({}); // Reset errors
      // console.log('[EditQuestionModal useEffect] editedQuestion form with question:', editedQuestion);

      
    } else if (!isOpen) {
      // Optional: Clean up state when modal is closed
      // setEditedQuestion(null);
      // setNewOptionText('');
    }
  }, [initialQuestion, isOpen]);

  const qTypeOptions = useMemo(() => {
    if (!editedQuestion?.bloomLevel || !questionTypesByBloom[editedQuestion.bloomLevel]) {
      return [{ value: "", label: "Chọn Bloom trước", disabled: true }]; // Option này bị disabled
    }
    const typesForBloom: AppQuestionType[] = questionTypesByBloom[editedQuestion.bloomLevel];
    return [
      { value: "", label: "Chọn loại câu hỏi", disabled: false }, // Option này không bị disabled
      ...typesForBloom.map(qt => ({
        value: qt.id,
        label: qt.name,
        disabled: false // Các option này không bị disabled
      }))
    ];
  }, [editedQuestion?.bloomLevel]);

  // Hàm kiểm tra xem dữ liệu có thay đổi so với ban đầu hay không
  const hasChanges = (): boolean => {
    if (!editedQuestion || !originalQuestion) return false;
    
    // Hàm so sánh sâu 2 đối tượng
    const isEqual = (obj1: any, obj2: any): boolean => {
      // So sánh các thuộc tính cơ bản
      if (obj1 === obj2) return true;
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) return false;
      
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      // Nếu số lượng thuộc tính khác nhau
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        // Bỏ qua thuộc tính genbyLLM khi so sánh
        if (key === 'genbyLLM') continue;
        
        // Xử lý trường hợp mảng đặc biệt (options)
        if (key === 'options' && Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
          if (obj1[key].length !== obj2[key].length) return false;
          
          // So sánh từng option trong mảng
          for (let i = 0; i < obj1[key].length; i++) {
            const option1 = obj1[key][i];
            const option2 = obj2[key][i];
            
            if (!isEqual(option1, option2)) return false;
          }
          continue;
        }
        
        // Xử lý các thuộc tính đối tượng lồng nhau (context, explanation)
        if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
          if (!isEqual(obj1[key], obj2[key])) return false;
          continue;
        }
        
        // So sánh thuộc tính thông thường
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
      
      return true;
    };
    
    // Thực hiện so sánh đối tượng editedQuestion và originalQuestion
    return !isEqual(editedQuestion, originalQuestion);
  };

  if (!isOpen || !editedQuestion) { // Kiểm tra editedQuestion trước khi render form
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setEditedQuestion(prev => {
      if (!prev) return null;
      let newEditedQuestion = { ...prev };

      if (name.includes('.')) {
        const [parentKey, childKey] = name.split('.');
        newEditedQuestion = {
          ...prev,
          [parentKey as keyof Question]: {
            ...(prev[parentKey as keyof Question] as any),
            [childKey]: type === 'checkbox' && checked !== undefined ? checked : value
          }
        };
      } else {
        newEditedQuestion = {
          ...prev,
          [name as keyof Question]: type === 'checkbox' && checked !== undefined ? checked : value
        };
      }
      // Nếu thay đổi Bloom Level, reset Question Type
      if (name === 'bloomLevel') {
        newEditedQuestion.questionType = '';
      }
      return newEditedQuestion;
    });
    if (formErrors[name]) {
        setFormErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target; // name sẽ là "correct" hoặc "wrong"
    setEditedQuestion(prev => {
      if (!prev) return null;
      return {
        ...prev,
        explanation: {
          ...(prev.explanation || { correct: '', A: '' ,B: '',C: '',D: ''}), // Đảm bảo explanation tồn tại
          [name]: value
        }
      };
    });
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    const newOption: QuestionOption = { id: uuidv4(), text: newOptionText, isCorrect: false }; // isCorrect mặc định là false
    setEditedQuestion(prev => {
      if (!prev) return null;
      return {
        ...prev,
        options: [...(prev.options || []), newOption]
      };
    });
    setNewOptionText('');
  };

  const handleUpdateOptionText = (id: string, text: string) => {
    setEditedQuestion(prev => {
      if (!prev) return null;
      return {
        ...prev,
        options: (prev.options || []).map(option =>
          option.id === id ? { ...option, text } : option
        )
      };
    });
  };

  const handleRemoveOption = (id: string) => {
    setEditedQuestion(prev => {
      if (!prev) return null;
      
      // Lọc bỏ option được chọn để xóa
      const updatedOptions = (prev.options || []).filter(option => option.id !== id);
      
      // Xử lý correctAnswerId
      let updatedCorrectAnswerId = prev.correctAnswerId;
      
      // Nếu xóa đáp án đúng hoặc không còn options nào
      if (prev.correctAnswerId === id || updatedOptions.length === 0) {
        // Tìm option đầu tiên để đặt làm đáp án đúng mới (nếu có)
        updatedCorrectAnswerId = updatedOptions.length > 0 ? updatedOptions[0].id : '';
      }
      
      return {
        ...prev,
        options: updatedOptions,
        correctAnswerId: updatedCorrectAnswerId
      };
    });
  };

  const handleSetCorrectAnswer = (id: string) => {
    setEditedQuestion(prev => {
      if (!prev) return null;
      return {
        ...prev,
        correctAnswerId: id,
        options: (prev.options || []).map(opt => ({ ...opt, isCorrect: opt.id === id })) // Cập nhật isCorrect
      };
    });
  };

  const validateForm = (): boolean => {
    if (!editedQuestion) return false;
    const newErrors: Record<string, string> = {};
    if (!editedQuestion.text?.trim()) newErrors.text = "Nội dung câu hỏi không được để trống.";
    if (!editedQuestion.bloomLevel) newErrors.bloomLevel = "Vui lòng chọn cấp độ Bloom.";
    if (!editedQuestion.questionType) newErrors.questionType = "Vui lòng chọn loại câu hỏi.";
    if (!editedQuestion.options || editedQuestion.options.length === 0) {
        newErrors.options = "Câu hỏi phải có ít nhất một lựa chọn.";
    } else if (!editedQuestion.correctAnswerId) {
        newErrors.correctAnswerId = "Vui lòng chọn một đáp án đúng.";
    } else if (!editedQuestion.options.find(opt => opt.id === editedQuestion.correctAnswerId)) {
        newErrors.correctAnswerId = "Đáp án đúng được chọn không còn tồn tại.";
    }
    // Thêm các validate khác nếu cần
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedQuestion) return;

    if (!validateForm()) {
        console.log('[EditQuestionModal handleSubmit] Validation failed:', formErrors);
        // Có thể tìm tab đầu tiên có lỗi và chuyển đến đó
        if (formErrors.text || formErrors.bloomLevel || formErrors.questionType) setActiveTab('basic');
        else if (formErrors.options || formErrors.correctAnswerId) setActiveTab('options');
        // ...
        return;
    }
    
    // Kiểm tra xem có thay đổi nào không và cập nhật genbyLLM nếu cần
    const finalQuestion = { ...editedQuestion };
    if (hasChanges()) {
      // Nếu có thay đổi, đặt genbyLLM thành false
      finalQuestion.genbyLLM = false;
      console.log('[EditQuestionModal handleSubmit] Đã phát hiện thay đổi, đặt genbyLLM = false');
    }
    
    console.log('[EditQuestionModal handleSubmit] Calling onSave with:', JSON.parse(JSON.stringify(finalQuestion)));
    onSave(finalQuestion);
  };


  const togglePreviewMode = () => setPreviewMode(!previewMode);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Chỉnh sửa câu hỏi (ID: {initialQuestion?.id})</h2>
          <div className="modal-controls">
            <button type="button" className={`preview-toggle ${previewMode ? 'active' : ''}`} onClick={togglePreviewMode}>
              <i className="fas fa-eye"></i> {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
            </button>
            <button className="close-button" onClick={onClose}><i className="fas fa-times"></i></button>
          </div>
        </div>

        {previewMode ? (
          <div className="preview-mode-container">
            {/* Phần Preview JSX của bạn (giữ nguyên hoặc điều chỉnh nếu editedQuestion có thể null) */}
            {editedQuestion && (
              <>
                <div className="question-preview">
                  {/* ... (Nội dung preview sử dụng editedQuestion) ... */}
                  <div className="question-header-preview">
                    <div className="question-number-display">Câu hỏi số: <span>{editedQuestion.number}</span></div>
                    <div className="question-tags">
                      <span className="tag bloom-tag">Bloom: {editedQuestion.bloomLevel}</span>
                      <span className="tag qtype-tag">Q-Type: {
                        // Tìm name của q-type để hiển thị
                        editedQuestion.bloomLevel && questionTypesByBloom[editedQuestion.bloomLevel]?.find(qt => qt.id === editedQuestion.questionType)?.name || editedQuestion.questionType
                      }</span>
                      {editedQuestion.genbyLLM !== undefined && (
                        <span className={`tag ${editedQuestion.genbyLLM ? 'llm-tag' : 'human-tag'}`}>
                          {editedQuestion.genbyLLM ? 'AI Generated' : 'Human Edited'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Context Info */}
                  {editedQuestion.context && (
                    <div className="question-context-info card-section">
                      {editedQuestion.context.courseTitle && <h4 className="context-course-title"><i className="fas fa-book-open"></i> Khóa học: <span>{editedQuestion.context.courseTitle}</span></h4>}
                      {editedQuestion.context.courseDescription && <p className="context-course-desc">{editedQuestion.context.courseDescription}</p>}
                      {editedQuestion.context.moduleNumber && <p className="context-module-info"><i className="fas fa-puzzle-piece"></i> Module: <strong>{String(editedQuestion.context.moduleNumber)}</strong></p>}
                      {editedQuestion.context.topic && <p className="context-topic-info"><i className="fas fa-tags"></i> Chủ đề: <strong>{editedQuestion.context.topic}</strong></p>}
                    </div>
                  )}
                  {/* Question Content */}
                  <div className="card-section">
                    <h3><i className="fas fa-question-circle"></i> Nội dung câu hỏi:</h3>
                    <div className="question-content">
                        <ContentRenderer text={editedQuestion.text} keyPrefix={`preview-question-content-${editedQuestion.id}`} />
                    </div>
                  </div>
                  {/* Options List */}
                  <div className="card-section">
                    <h3><i className="fas fa-list-ul"></i> Các lựa chọn:</h3>
                    <ul className="options-list">
                      {editedQuestion.options && editedQuestion.options.length > 0 ? (
                        editedQuestion.options.map((option: QuestionOption) => (
                          <li key={option.id} className={option.id === editedQuestion.correctAnswerId ? 'correct-option' : ''}>
                            <div className="option-text-content">
                              <ContentRenderer text={option.text} keyPrefix={`preview-option-${option.id}`} />
                            </div>
                          </li>
                        ))
                      ) : (<li className="empty-state">Không có lựa chọn.</li>)}
                    </ul>
                  </div>
                  {/* Explanation Section */}
                  <div className="card-section">
                    <h3><i className="fas fa-lightbulb"></i> Giải thích:</h3>
                    <div className="explanation-section">
                        <div className="correct-explanation">
                            <h4>Đáp án đúng:</h4>
                            <div className="explanation-content">
                                <ContentRenderer text={editedQuestion.explanation?.correct || ''} keyPrefix={`preview-explanation-correct-${editedQuestion.id}`} />
                            </div>
                        </div>
                        {editedQuestion.explanation?.wrong && (
                            <div className="wrong-explanation">
                                <h4>Lý do những đáp án khác không đúng:</h4>
                                <div className="explanation-content">
                                    <ContentRenderer text={editedQuestion.explanation.wrong} keyPrefix={`preview-explanation-wrong-${editedQuestion.id}`} />
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button type="button" variant="secondary" onClick={togglePreviewMode}>Quay lại chỉnh sửa</Button>
                  <Button type="button" variant="primary" onClick={handleSubmit}>
                    {hasChanges() ? 'Lưu thay đổi (sẽ đánh dấu là Human Edited)' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-question-form">
            <div className="form-tabs">
              {/* Nút Tabs */}
              <button type="button" className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}><i className="fas fa-info-circle"></i> Thông tin cơ bản</button>
              <button type="button" className={`tab-button ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}><i className="fas fa-file-alt"></i> Nội dung & Context</button>
              <button type="button" className={`tab-button ${activeTab === 'options' ? 'active' : ''}`} onClick={() => setActiveTab('options')}><i className="fas fa-list-ul"></i> Lựa chọn</button>
              <button type="button" className={`tab-button ${activeTab === 'explanation' ? 'active' : ''}`} onClick={() => setActiveTab('explanation')}><i className="fas fa-lightbulb"></i> Giải thích</button>
            </div>

            {activeTab === 'basic' && (
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                <div className="form-group"><label htmlFor="id">ID câu hỏi:</label><input type="text" id="id" name="id" value={editedQuestion.id || ''} disabled /></div>
                <div className="form-group"><label htmlFor="number">Số câu hỏi:</label><input type="number" id="number" name="number" value={editedQuestion.number || ''} onChange={handleInputChange} /></div>
                <div className="form-group">
                  <label htmlFor="bloomLevel">Cấp độ Bloom:</label>
                  <select id="bloomLevel" name="bloomLevel" value={editedQuestion.bloomLevel || ''} onChange={handleInputChange}>
                    <option value="">Chọn cấp độ</option>
                    {(Object.values(BloomLevel) as BloomLevel[]).map(level => (
                      <option key={level} value={level}>{bloomLevelLabels[level]}</option>
                    ))}
                  </select>
                  {formErrors.bloomLevel && <p className="error-text">{formErrors.bloomLevel}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="questionType">Loại câu hỏi:</label>
                  <select id="questionType" name="questionType" value={editedQuestion.questionType || ''} onChange={handleInputChange} disabled={!editedQuestion.bloomLevel || qTypeOptions.length <=1}>
                    {qTypeOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
                  </select>
                  {formErrors.questionType && <p className="error-text">{formErrors.questionType}</p>}
                </div>
                {editedQuestion.genbyLLM !== undefined && (
                  <div className="form-group">
                    <label>Trạng thái:</label>
                    <div className={`status-badge ${editedQuestion.genbyLLM ? 'llm-badge' : 'human-badge'}`}>
                      {editedQuestion.genbyLLM ? 'AI Generated' : 'Human Edited'}
                    </div>
                    {hasChanges() && editedQuestion.genbyLLM && (
                      <p className="info-text">Câu hỏi sẽ được đánh dấu là "Human Edited" sau khi lưu</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div className="form-section">
                <h3>Nội dung câu hỏi & Context</h3>
                <div className="form-group">
                  <label htmlFor="text">Nội dung câu hỏi:</label>
                  <textarea id="text" name="text" value={editedQuestion.text || ''} onChange={handleInputChange} rows={10} placeholder="Nhập nội dung... Hỗ trợ Markdown."/>
                  {formErrors.text && <p className="error-text">{formErrors.text}</p>}
                </div>
                <div className="form-group"><label htmlFor="context.courseTitle">Khóa học:</label><input type="text" id="context.courseTitle" name="context.courseTitle" value={editedQuestion.context?.courseTitle || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="context.courseDescription">Mô tả khóa học:</label><textarea id="context.courseDescription" name="context.courseDescription" value={editedQuestion.context?.courseDescription || ''} onChange={handleInputChange} rows={3}/></div>
                <div className="form-group"><label htmlFor="context.moduleNumber">Số module:</label><input type="text" id="context.moduleNumber" name="context.moduleNumber" value={editedQuestion.context?.moduleNumber || ''} onChange={handleInputChange} /></div>
                <div className="form-group"><label htmlFor="context.topic">Chủ đề:</label><input type="text" id="context.topic" name="context.topic" value={editedQuestion.context?.topic || ''} onChange={handleInputChange} /></div>
              </div>
            )}

            {activeTab === 'options' && (
              <div className="form-section">
                <h3>Các lựa chọn</h3>
                <div className="options-container">
                  {editedQuestion.options && editedQuestion.options.length > 0 ? (
                    editedQuestion.options.map(option => (
                      <div key={option.id} className={`option-edit-row ${editedQuestion.correctAnswerId === option.id ? 'correct' : ''}`}>
                        <div className="option-radio-container">
                            <input type="radio" name="correctAnswer" checked={editedQuestion.correctAnswerId === option.id} onChange={() => handleSetCorrectAnswer(option.id)} id={`option-radio-${option.id}`}/>
                            <label htmlFor={`option-radio-${option.id}`} className="correct-label">Đáp án đúng</label>
                        </div>
                        <textarea value={option.text} onChange={(e) => handleUpdateOptionText(option.id, e.target.value)} rows={2} placeholder="Nội dung lựa chọn"/>
                        <button type="button" className="remove-option-btn" onClick={() => handleRemoveOption(option.id)} title="Xóa lựa chọn"><i className="fas fa-trash"></i></button>
                      </div>
                    ))
                  ) : (<p className="empty-state">Chưa có lựa chọn nào.</p>)}
                   {formErrors.options && <p className="error-text">{formErrors.options}</p>}
                   {formErrors.correctAnswerId && <p className="error-text">{formErrors.correctAnswerId}</p>}
                </div>
                <div className="add-option-container">
                  <textarea value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} placeholder="Nội dung lựa chọn mới..." rows={2}/>
                  <button type="button" className="add-option-btn" onClick={handleAddOption} disabled={!newOptionText.trim()}><i className="fas fa-plus"></i> Thêm</button>
                </div>
              </div>
            )}

            {activeTab === 'explanation' && (
                <div className="form-section">
                  <h3>Giải thích đáp án</h3>
                  <div className="form-group">
                  <label htmlFor="explanation.correct">Giải thích cho đáp án đúng:</label>
                  <textarea 
                    id="explanation.correct" 
                    name="correct" 
                    value={editedQuestion.explanation?.correct || ''} 
                    onChange={handleExplanationChange} 
                    rows={8} 
                    placeholder="Giải thích chi tiết..."
                  />
                </div>
    
                <h4>Giải thích cho từng đáp án:</h4>
    
                {/* Các trường giải thích riêng cho từng đáp án A, B, C, D */}
                {['A', 'B', 'C', 'D'].map(optionKey => (
                <div key={`explanation-input-${optionKey}`} className="form-group">
                  <label htmlFor={`explanation.${optionKey}`}>Đáp án {optionKey}:</label>
                  <textarea 
                    id={`explanation.${optionKey}`} 
                    name={optionKey}
                    value={editedQuestion.explanation?.[optionKey] || ''} 
                    onChange={handleExplanationChange} 
                    rows={4} 
                    placeholder={`Giải thích tại sao đáp án ${optionKey} đúng/sai...`}
                  />
                </div>
                ))}
                </div>
              )}

            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
              <Button type="button" variant="secondary" onClick={togglePreviewMode}><i className="fas fa-eye"></i> Xem trước</Button>
              <Button type="submit" variant="primary">
                <i className="fas fa-save"></i> 
                {hasChanges() && editedQuestion.genbyLLM ? 'Lưu thay đổi (sẽ đánh dấu là Human Edited)' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};