// src/utils/questionUtils.ts
import type { Question, QuestionOption, UserConfig } from '../models/Question';
import { questionTypesByBloom } from '../models/QuestionType'; // Giả sử QuestionType được export từ đây
import { BloomLevel } from '../models/BloomLevel';

export function normalizeOptionsArray(optionsData: any, correctAnswerKey?: string): QuestionOption[] {
  const options: QuestionOption[] = [];
  if (typeof optionsData === 'object' && optionsData !== null && !Array.isArray(optionsData)) {
    Object.entries(optionsData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        options.push({
          id: key,
          text: value,
          isCorrect: correctAnswerKey ? key === correctAnswerKey : undefined
        });
      }
    });
  } else if (Array.isArray(optionsData)) {
    optionsData.forEach((optText, i) => {
      if (typeof optText === 'string') {
        const letter = String.fromCharCode(65 + i); // A, B, C, D...
        options.push({
          id: letter,
          text: optText,
          isCorrect: correctAnswerKey ? letter === correctAnswerKey : undefined
        });
      }
    });
  }
  return options;
}

export function normalizeQuestion(rawQ: any, index: number): Question {
  const correctAnswerId = String(rawQ.correct_answer || rawQ.correctAnswer || '');
  const bloomLevel = (rawQ.bloom_level || null) as BloomLevel | null;
  let qTypeName = rawQ.q_type || rawQ.Question_type || rawQ.question_type || '';

  if (bloomLevel && qTypeName && questionTypesByBloom[bloomLevel]) {
    const qTypesForBloom = questionTypesByBloom[bloomLevel];
    const foundQType = qTypesForBloom?.find(qt => qt.name === qTypeName || qt.id === qTypeName);
    if (foundQType) {
      qTypeName = foundQType.name;
    }
  }

  return {
    id: String(rawQ.number !== undefined && !isNaN(parseInt(String(rawQ.number))) ? rawQ.number : (rawQ.id || `gen_${Date.now()}_${index}`)),
    number: parseInt(String(rawQ.id || rawQ.number || index + 1), 10),
    text: rawQ.question || rawQ.text || '[Chưa có nội dung câu hỏi]',
    options: normalizeOptionsArray(rawQ.options, correctAnswerId),
    correctAnswerId: correctAnswerId,
    bloomLevel: bloomLevel || BloomLevel.Remember,
    questionType: qTypeName,
    explanation: rawQ.explanation,
    context: {
      courseTitle: rawQ.course_title || rawQ.courseTitle || 'Chưa có tiêu đề khóa học',
      courseDescription: rawQ.course_descrisption || rawQ.courseDescription || 'Chưa có mô tả khóa học',
      moduleNumber: rawQ.Module || rawQ.moduleNumber || rawQ.module || null,
    },
    tokensInput: rawQ.tokensIn !== undefined ? parseInt(String(rawQ.tokensIn)) : undefined,
    tokensOutput: rawQ.tokensOut !== undefined ? parseInt(String(rawQ.tokensOut)) : undefined,
    rating: rawQ.rating !== undefined ? parseInt(String(rawQ.rating)) : undefined,
    genbyLLM: rawQ.genbyLLM !== undefined ? Boolean(rawQ.genbyLLM) : true,
  };
}

// src/utils/questionUtils.ts (hoặc nơi bạn định nghĩa applyFilters)
export function applyFilters(questions: Question[], config: UserConfig): Question[] {
  let filtered = [...questions];
  if (config.bloomLevel) {
    console.log('[applyFilters] Filtering by Bloom:', config.bloomLevel);
    filtered = filtered.filter(q => q.bloomLevel === config.bloomLevel);
  }
  if (config.questionType) {
    console.log('[applyFilters] Filtering by Q-Type:', config.questionType, 'Current filtered count before Q-Type:', filtered.length);
    filtered = filtered.filter(q => {
      // Thêm log để xem giá trị so sánh
      console.log(`[applyFilters] Comparing question's Q-Type: "${q.questionType}" with filter: "${config.questionType}" -> Match: ${q.questionType === config.questionType}`);
      return q.questionType === config.questionType;
    });
    console.log('[applyFilters] Filtered count after Q-Type:', filtered.length);
  }
  return filtered;
}