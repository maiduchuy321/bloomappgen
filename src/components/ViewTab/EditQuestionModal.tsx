// src/components/question/EditQuestionModal.tsx
import React, { useState, useEffect } from 'react';
import type { Question, QuestionOption } from '../../models/Question';
import { Button } from '../shared/Button';
import { v4 as uuidv4 } from 'uuid';
import { ContentRenderer } from '../shared/ContentRenderer';
import './EditQuestionModal.css';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onSave: (updatedQuestion: Question) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave
}) => {
  // Create a deep clone of the question to avoid reference issues
  const [editedQuestion, setEditedQuestion] = useState<Question>(() => JSON.parse(JSON.stringify(question)));
  const [newOptionText, setNewOptionText] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [previewMode, setPreviewMode] = useState(false);

  // Make sure context and explanation objects are initialized
  useEffect(() => {
    if (isOpen) {
      // Deep clone to avoid reference issues
      const questionCopy = JSON.parse(JSON.stringify(question));
      
      // Ensure all required objects exist
      if (!questionCopy.context) {
        questionCopy.context = {
          courseTitle: '',
          courseDescription: '',
          moduleNumber: '',
          topic: ''
        };
      }
      
      if (!questionCopy.explanation) {
        questionCopy.explanation = {
          correct: '',
          wrong: ''
        };
      }
      
      if (!questionCopy.options) {
        questionCopy.options = [];
      }
      
      if (!questionCopy.tags && questionCopy.tags !== '') {
        questionCopy.tags = [];
      }
      
      setEditedQuestion(questionCopy);
      setActiveTab('basic');
      setPreviewMode(false);
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedQuestion(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Question] as any),
          [child]: value
        }
      }));
    } else {
      setEditedQuestion(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setEditedQuestion(prev => ({
      ...prev,
      explanation: {
        ...prev.explanation,
        [name]: value
      }
    }));
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    
    const newOption: QuestionOption = {
      id: uuidv4(),
      text: newOptionText,
    };

    setEditedQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
    
    setNewOptionText('');
  };

  const handleUpdateOption = (id: string, text: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: (prev.options || []).map(option => 
        option.id === id ? { ...option, text } : option
      )
    }));
  };

  const handleRemoveOption = (id: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter(option => option.id !== id),
      correctAnswerId: prev.correctAnswerId === id ? '' : prev.correctAnswerId
    }));
  };

  const handleSetCorrectAnswer = (id: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      correctAnswerId: id
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize data before saving
    const normalizedQuestion = normalizeQuestionBeforeSave(editedQuestion);
    
    // Call the onSave callback with the normalized question
    onSave(normalizedQuestion);
  };

  // Normalize question data before saving
  const normalizeQuestionBeforeSave = (question: Question): Question => {
    // Convert empty strings to proper values
    const normalizedQuestion = { ...question };
    
    // Convert number string to actual number
    if (typeof normalizedQuestion.number === 'string') {
      normalizedQuestion.number = parseInt(normalizedQuestion.number, 10) || 0;
    }
    
    // Make sure context object is complete
    if (!normalizedQuestion.context) {
      normalizedQuestion.context = {
        courseTitle: '',
        courseDescription: '',
        moduleNumber: '',
        topic: ''
      };
    }
    
    // Parse module number to integer if it's a string
    if (typeof normalizedQuestion.context.moduleNumber === 'string') {
      const moduleNumberString = normalizedQuestion.context.moduleNumber.trim();
        normalizedQuestion.context.moduleNumber = moduleNumberString 
        ? String(parseInt(moduleNumberString, 10) || 0) 
        : '0';  
    }
    
    // Ensure explanation object exists
    if (!normalizedQuestion.explanation) {
      normalizedQuestion.explanation = {
        correct: '',
        wrong: ''
      };
    }
    
    // Make sure options is an array
    if (!Array.isArray(normalizedQuestion.options)) {
      normalizedQuestion.options = [];
    }
    
    return normalizedQuestion;
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Chỉnh sửa câu hỏi</h2>
          <div className="modal-controls">
            <button 
              type="button" 
              className={`preview-toggle ${previewMode ? 'active' : ''}`}
              onClick={togglePreviewMode}
            >
              <i className="fas fa-eye"></i> {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
            </button>
            <button className="close-button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="preview-mode-container">
            <div className="question-preview">
              <div className="question-header-preview">
                <div className="question-number-display">
                  Câu hỏi số: <span>{editedQuestion.number}</span>
                </div>
                <div className="question-tags">
                  <span className="tag bloom-tag">Bloom: {editedQuestion.bloomLevel}</span>
                  <span className="tag qtype-tag">Q-Type: {editedQuestion.questionType}</span>
                </div>
              </div>

              {editedQuestion.context && (
                <div className="question-context-info card-section">
                  {editedQuestion.context.courseTitle && (
                    <h4 className="context-course-title">
                      <i className="fas fa-book-open"></i> Khóa học:{' '}
                      <span>{editedQuestion.context.courseTitle}</span>
                    </h4>
                  )}
                  {editedQuestion.context.courseDescription && (
                    <p className="context-course-desc">{editedQuestion.context.courseDescription}</p>
                  )}
                  {editedQuestion.context.moduleNumber && (
                    <p className="context-module-info">
                      <i className="fas fa-puzzle-piece"></i> Module:{' '}
                      <strong>{String(editedQuestion.context.moduleNumber)}</strong>
                    </p>
                  )}
                  {editedQuestion.context.topic && (
                    <p className="context-topic-info">
                      <i className="fas fa-tags"></i> Chủ đề:{' '}
                      <strong>{editedQuestion.context.topic}</strong>
                    </p>
                  )}
                </div>
              )}

              <div className="card-section">
                <h3><i className="fas fa-question-circle"></i> Nội dung câu hỏi:</h3>
                <div className="question-content">
                  <ContentRenderer text={editedQuestion.text} keyPrefix={`preview-question-content`} />
                </div>
              </div>

              <div className="card-section">
                <h3><i className="fas fa-list-ul"></i> Các lựa chọn:</h3>
                <ul className="options-list">
                  {editedQuestion.options && editedQuestion.options.length > 0 ? (
                    editedQuestion.options.map((option: QuestionOption) => (
                      <li
                        key={option.id}
                        className={option.id === editedQuestion.correctAnswerId ? 'correct-option' : ''}
                      >
                        <div className="option-text-content">
                          <ContentRenderer text={option.text} keyPrefix={`preview-option-${option.id}`} />
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="empty-state">Không có lựa chọn.</li>
                  )}
                </ul>
              </div>

              <div className="card-section">
                <h3><i className="fas fa-lightbulb"></i> Giải thích:</h3>
                <div className="explanation-section">
                  <div className="correct-explanation">
                    <h4>Đáp án đúng:</h4>
                    <div className="explanation-content">
                      <ContentRenderer text={editedQuestion.explanation?.correct || ''} keyPrefix="preview-explanation" />
                    </div>
                  </div>
                  {editedQuestion.explanation?.wrong && (
                    <div className="wrong-explanation">
                      <h4>Lý do những đáp án khác không đúng:</h4>
                      <div className="explanation-content">
                        <ContentRenderer text={editedQuestion.explanation.wrong} keyPrefix="preview-wrong-explanation" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={togglePreviewMode}>
                Quay lại chỉnh sửa
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmit}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-question-form">
            <div className="form-tabs">
              <button 
                type="button"
                className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                <i className="fas fa-info-circle"></i> Thông tin cơ bản
              </button>
              <button 
                type="button"
                className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <i className="fas fa-file-alt"></i> Nội dung
              </button>
              <button 
                type="button"
                className={`tab-button ${activeTab === 'options' ? 'active' : ''}`}
                onClick={() => setActiveTab('options')}
              >
                <i className="fas fa-list-ul"></i> Lựa chọn
              </button>
              <button 
                type="button"
                className={`tab-button ${activeTab === 'explanation' ? 'active' : ''}`}
                onClick={() => setActiveTab('explanation')}
              >
                <i className="fas fa-lightbulb"></i> Giải thích
              </button>
              <button 
                type="button"
                className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
              >
                <i className="fas fa-tags"></i> Metadata
              </button>
            </div>

            {activeTab === 'basic' && (
              <div className="form-section">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label htmlFor="id">ID câu hỏi:</label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={editedQuestion.id || ''}
                    disabled
                  />
                  <small className="form-helper">ID tự động tạo khi tạo mới câu hỏi</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="number">Số câu hỏi:</label>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={editedQuestion.number || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bloomLevel">Cấp độ Bloom:</label>
                  <select
                    id="bloomLevel"
                    name="bloomLevel"
                    value={editedQuestion.bloomLevel || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="Remembering">Nhớ</option>
                    <option value="Understanding">Hiểu</option>
                    <option value="Applying">Áp dụng</option>
                    <option value="Analyzing">Phân tích</option>
                    <option value="Evaluating">Đánh giá</option>
                    <option value="Creating">Sáng tạo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="questionType">Loại câu hỏi:</label>
                  <select
                    id="questionType"
                    name="questionType"
                    value={editedQuestion.questionType || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn loại</option>
                    <option value="Multiple-choice">Trắc nghiệm</option>
                    <option value="True/False">Đúng/Sai</option>
                    <option value="Fill-in-the-blank">Điền vào chỗ trống</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="form-section">
                <h3>Nội dung câu hỏi</h3>
                
                <div className="form-group">
                  <label htmlFor="text">Nội dung câu hỏi:</label>
                  <div className="editor-container">
                    <textarea
                      id="text"
                      name="text"
                      value={editedQuestion.text || ''}
                      onChange={handleInputChange}
                      rows={10}
                      placeholder="Nhập nội dung câu hỏi ở đây. Hỗ trợ Markdown và code blocks ```..."
                    />
                    <div className="editor-hints">
                      <small>Hỗ trợ Markdown: **in đậm**, *in nghiêng*, và code blocks với ```</small>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="context.courseTitle">Khóa học:</label>
                  <input
                    type="text"
                    id="context.courseTitle"
                    name="context.courseTitle"
                    value={editedQuestion.context?.courseTitle || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="context.courseDescription">Mô tả khóa học:</label>
                  <textarea
                    id="context.courseDescription"
                    name="context.courseDescription"
                    value={editedQuestion.context?.courseDescription || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="context.moduleNumber">Số module:</label>
                  <input
                    type="number"
                    id="context.moduleNumber"
                    name="context.moduleNumber"
                    value={editedQuestion.context?.moduleNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="context.topic">Chủ đề:</label>
                  <input
                    type="text"
                    id="context.topic"
                    name="context.topic"
                    value={editedQuestion.context?.topic || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {activeTab === 'options' && (
              <div className="form-section">
                <h3>Các lựa chọn</h3>
                
                <div className="options-container">
                  {editedQuestion.options && editedQuestion.options.length > 0 ? (
                    editedQuestion.options.map(option => (
                      <div 
                        key={option.id} 
                        className={`option-edit-row ${editedQuestion.correctAnswerId === option.id ? 'correct' : ''}`}
                      >
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={editedQuestion.correctAnswerId === option.id}
                          onChange={() => handleSetCorrectAnswer(option.id)}
                          id={`option-${option.id}`}
                        />
                        <label htmlFor={`option-${option.id}`} className="correct-label">
                          Đáp án đúng
                        </label>
                        <textarea
                          value={option.text}
                          onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                          rows={3}
                          placeholder="Nội dung lựa chọn (hỗ trợ Markdown)"
                        />
                        <button 
                          type="button" 
                          className="remove-option-btn"
                          onClick={() => handleRemoveOption(option.id)}
                          title="Xóa lựa chọn này"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">Chưa có lựa chọn nào. Hãy thêm lựa chọn bên dưới.</p>
                  )}
                </div>
                
                <div className="add-option-container">
                  <textarea
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="Nhập lựa chọn mới... (hỗ trợ Markdown)"
                    rows={3}
                  />
                  <button
                    type="button"
                    className="add-option-btn"
                    onClick={handleAddOption}
                    disabled={!newOptionText.trim()}
                  >
                    <i className="fas fa-plus"></i> Thêm lựa chọn
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'explanation' && (
              <div className="form-section">
                <h3>Giải thích đáp án</h3>
                <div className="form-group">
                  <label htmlFor="explanation-correct">Giải thích cho đáp án đúng:</label>
                  <textarea
                    id="explanation-correct"
                    name="correct"
                    value={editedQuestion.explanation?.correct || ''}
                    onChange={handleExplanationChange}
                    rows={8}
                    placeholder="Giải thích chi tiết về lý do tại sao đáp án được chọn là đúng (hỗ trợ Markdown)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="explanation-wrong">Giải thích cho đáp án sai (tùy chọn):</label>
                  <textarea
                    id="explanation-wrong"
                    name="wrong"
                    value={editedQuestion.explanation?.wrong || ''}
                    onChange={handleExplanationChange}
                    rows={5}
                    placeholder="Giải thích tại sao các lựa chọn khác là sai (hỗ trợ Markdown)"
                  />
                </div>
              </div>
            )}

            {/* {activeTab === 'metadata' && (
              <div className="form-section">
                <h3>Metadata và thông tin phân loại</h3>
                
                <div className="form-group">
                  <label htmlFor="difficulty">Độ khó:</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={editedQuestion.difficulty || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn độ khó</option>
                    <option value="Easy">Dễ</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Khó</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="points">Điểm số:</label>
                  <input
                    type="number"
                    id="points"
                    name="points"
                    value={editedQuestion.points || ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Danh mục:</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={editedQuestion.category || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập danh mục câu hỏi"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags:</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={Array.isArray(editedQuestion.tags) ? editedQuestion.tags.join(', ') : (editedQuestion.tags || '')}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setEditedQuestion(prev => ({
                        ...prev,
                        tags: tagsArray
                      }));
                    }}
                    placeholder="Nhập tags, cách nhau bởi dấu phẩy"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="createdBy">Người tạo:</label>
                  <input
                    type="text"
                    id="createdBy"
                    name="createdBy"
                    value={editedQuestion.createdBy || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastUpdatedBy">Cập nhật lần cuối bởi:</label>
                  <input
                    type="text"
                    id="lastUpdatedBy"
                    name="lastUpdatedBy"
                    value={editedQuestion.lastUpdatedBy || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )} */}

            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={onClose}>
                Hủy
              </Button>
              <Button type="button" variant="secondary" onClick={togglePreviewMode}>
                <i className="fas fa-eye"></i> Xem trước
              </Button>
              <Button type="submit" variant="primary">
                <i className="fas fa-save"></i> Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};