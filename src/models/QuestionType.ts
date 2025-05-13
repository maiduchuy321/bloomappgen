// src/models/QuestionType.ts
import { BloomLevel } from './BloomLevel';

export interface QuestionType {
  id: string;
  name: string;
  bloomLevel: BloomLevel;
  description?: string;
}

// Mapping của các question types cho mỗi bloom level
export const questionTypesByBloom: Record<BloomLevel, QuestionType[]> = {
  [BloomLevel.Remember]: [
    { id: "Recall", name: "Recall", bloomLevel: BloomLevel.Remember, description: "Ghi nhớ và tái hiện thông tin" },
  ],
  [BloomLevel.Understand]: [
    { id: "Fill in the Blank", name: "Fill in the Blank", bloomLevel: BloomLevel.Understand, description: "Điền vào chỗ trống" },
  ],
  [BloomLevel.Apply]: [
    { id: "Fill in the Blank", name: "Fill in the Blank", bloomLevel: BloomLevel.Apply, description: "Điền vào chỗ trống" },
    { id: "Scenario Based", name: "Scenario Based", bloomLevel: BloomLevel.Apply, description: "Giải quyết vấn đề dựa trên tình huống" },
    { id: "Correct Output", name: "Correct Output", bloomLevel: BloomLevel.Apply, description: "Xác định kết quả đầu ra chính xác" },
  ],
  [BloomLevel.Analyze]: [
    { id: "Scenario Based", name: "Scenario Based", bloomLevel: BloomLevel.Analyze, description: "Phân tích tình huống" },
    { id: "Correct Output", name: "Correct Output", bloomLevel: BloomLevel.Analyze, description: "Phân tích kết quả đầu ra" },
    { id: "Code Analysis", name: "Code Analysis", bloomLevel: BloomLevel.Analyze, description: "Phân tích mã nguồn" },
  ],
  [BloomLevel.Evaluate]: [
    { id: "Code Analysis", name: "Code Analysis", bloomLevel: BloomLevel.Evaluate, description: "Đánh giá và phê bình mã nguồn" },
  ],
  [BloomLevel.Create]: [],
};