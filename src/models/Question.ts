// src/models/Question.ts
import { BloomLevel } from './BloomLevel';

export interface QuestionOption {
  id: string;
  text: string;
}

// Mô hình giải thích câu hỏi
export interface QuestionExplanation {
  correct?: string;
  [key: string]: string | undefined; // Cho phép các key động như A, B, C, D...
}

// Mô hình câu hỏi JSON input
export interface QuestionJson {
  number: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  correct_answer: string;
  code_in_stem: boolean;
  explanation: {
    correct: string;
    A: string;
    B: string;
    C: string;
    D: string;
    [key: string]: string;
  };
  question_type: string;
  bloom_level: string;
}

export interface CourseContext {
  courseTitle: string;
  courseDescription?: string;
  moduleNumber?: string;
  topic?: string; // Thêm trường topic để phù hợp với QuestionContext trong file trước
}

// Mô hình câu hỏi với rating thay thế cho isBookmarked
export interface Question {
  id: string;
  number: number;
  text: string;
  options: QuestionOption[];
  correctAnswerId: string;
  bloomLevel: BloomLevel;
  questionType: string;
  explanation?: QuestionExplanation;
  context?: CourseContext;
  tokensInput?: number;
  tokensOutput?: number;
  // isBookmarked?: boolean; // Đã bỏ
  rating?: number; // Thêm trường đánh giá từ 1-5
}

// Cấu hình người dùng
export interface UserConfig {
  bloomLevel: BloomLevel | '';
  questionType: string;
  numQuestions: number;
}

// Enum cho các nhãn đánh giá
export enum RatingLabel {
  NotRated = "Chưa đánh giá",
  CompletelyWrong = "Hoàn toàn sai",
  MostlyWrong = "Có nhiều sai sót",
  Acceptable = "Chấp nhận được",
  MostlyCorrect = "Khá chính xác",
  CompletelyCorrect = "Hoàn toàn đúng"
}

// Map các giá trị rating với nhãn tương ứng
export const getRatingLabel = (rating: number | undefined): string => {
  switch (rating) {
    case 0:
    case undefined:
      return RatingLabel.NotRated;
    case 1:
      return RatingLabel.CompletelyWrong;
    case 2:
      return RatingLabel.MostlyWrong;
    case 3:
      return RatingLabel.Acceptable;
    case 4:
      return RatingLabel.MostlyCorrect;
    case 5:
      return RatingLabel.CompletelyCorrect;
    default:
      return RatingLabel.NotRated;
  }
};