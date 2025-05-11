import React from 'react';
import { Question } from '../../models/Question';
import { Button } from '../shared/Button';
import { useQuestions } from '../../contexts/QuestionContext';
import { tableColumnsConfig, ColumnConfig } from './columnConfig';
// import './QuestionTable.css'; // CSS riêng

interface QuestionTableProps {
  questions: Question[];
  onViewQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string, questionText: string) => void;
  pageStartIndex: number; // Index bắt đầu của trang hiện tại (0-based)
}

export const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  onViewQuestion,
  onDeleteQuestion,
  pageStartIndex
}) => {

  if (!questions || questions.length === 0) {
    return (
      <div className="question-list">
        <table id="questions-table">
          <thead>
            <tr>
              {tableColumnsConfig.map(col => <th key={col.header} style={{ width: col.width }} className={col.textAlign}>{col.header}</th>)}
              <th style={{ width: '120px' }} className="actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={tableColumnsConfig.length + 1} className="empty-table">
                Không có câu hỏi nào để hiển thị.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="question-list">
      <table id="questions-table">
        <thead>
          <tr>
            {tableColumnsConfig.map(col => (
              <th key={col.header} style={{ width: col.width }} className={col.textAlign}>
                {col.header}
              </th>
            ))}
            <th style={{ width: '120px' }} className="actions">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, indexInPage) => (
            <tr key={q.id} data-question-id={q.id}>
              {tableColumnsConfig.map(colConfig => (
                <td key={`${q.id}-${colConfig.header}`} className={colConfig.textAlign}>
                  {colConfig.cell(q, indexInPage, pageStartIndex)}
                </td>
              ))}
              <td className="actions">
                <Button size="sm" onClick={() => onViewQuestion(q.id)} title="Xem chi tiết">
                  <i className="fas fa-eye"></i>
                </Button>
                <Button size="sm" variant="secondary" onClick={() => alert(`Chỉnh sửa ${q.id} (chưa làm)`)} title="Chỉnh sửa">
                  <i className="fas fa-edit"></i>
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDeleteQuestion(q.id, q.text.substring(0,30) + "...")} title="Xóa">
                  <i className="fas fa-trash-alt"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};