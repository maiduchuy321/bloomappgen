// src/components/ListTab/columnConfig.ts
import React from 'react'; 
import type { Question } from '../../models/Question';
import { escapeHtml } from '../../utils/formatters';

export interface ColumnConfig<T> {
  header: string;
  accessorKey?: keyof T | 'actions' | 'index'; // Key để lấy dữ liệu, hoặc 'actions' cho cột hành động, 'index' cho STT
  cell: (row: T, indexInPage: number, pageStartIndex: number) => React.ReactNode; // Hàm render cell
  textAlign?: 'text-center' | 'text-left' | 'text-right' | 'actions';
  width?: string;
}

export const tableColumnsConfig: ColumnConfig<Question>[] = [
  {
    header: '#',
    accessorKey: 'index',
    cell: (_row, indexInPage, pageStartIndex) => pageStartIndex + indexInPage + 1,
    textAlign: 'text-center',
    width: '50px'
  },
  {
    header: 'Course Title',
    accessorKey: 'context',
    cell: (row) => {
        const title = row.context?.courseTitle || '-';
        const shortTitle = title.substring(0, 40) + (title.length > 40 ? '...' : '');
        return escapeHtml(shortTitle) as string;
    },
    width: '180px'
  },
  // {
  //   header: 'Course Description',
  //   accessorKey: 'context',
  //   cell: (row) => {
  //       const desc = row.context?.courseDescription || '-';
  //       const shortDesc = desc.substring(0, 50) + (desc.length > 50 ? '...' : '');
  //       return escapeHtml(shortDesc) as string;
  //   },
  //   width: '220px'
  // },
  {
    header: 'Module',
    accessorKey: 'context',
    cell: (row) => escapeHtml(row.context?.moduleNumber || '-') as string,
    textAlign: 'text-center',
    width: '80px'
  },
  {
    header: 'Chủ đề (Topic)',
    accessorKey: 'context',
    cell: (row) => escapeHtml(row.context?.topic || '-') as string,
    width: '150px'
  },
  {
    header: 'Câu hỏi (Tóm tắt)',
    accessorKey: 'text',
    cell: (row) => {
      const snippet = (row.text || '').substring(0, 70);
      const ellipsis = (row.text?.length || 0) > 70 ? '...' : '';
      return escapeHtml(`${snippet}${ellipsis}`) as string;
    },
  },
  {
    header: 'Bloom',
    accessorKey: 'bloomLevel',
    cell: (row) => row.bloomLevel || 'N/A',
    textAlign: 'text-center',
    width: '120px'
  },
  {
    header: 'Q-Type',
    accessorKey: 'questionType', // Sẽ hiển thị ID, cần map sang name nếu muốn
    cell: (row) => row.questionType || 'N/A',
    textAlign: 'text-center',
    width: '120px'
  },
  {
    header: 'Created By',
    accessorKey: 'genbyLLM',
    cell: (row) => row.genbyLLM === true ? 'AI' : 'Human',
    textAlign: 'text-center',
    width: '100px'
  },
  {
    header: 'Rating',
    accessorKey: 'rating',
    cell: (row) => row.rating !== undefined ? row.rating : 'N/A',
    textAlign: 'text-center',
    width: '80px'
  },
  // 'Hành động' sẽ được xử lý riêng trong QuestionTable component
];