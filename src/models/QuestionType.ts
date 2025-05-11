// src/models/QuestionType.ts
import { BloomLevel } from '../models/BloomLevel';

export interface QuestionType {
  id: string;
  name: string;
  bloomLevel: BloomLevel;
  description?: string;
}

// Mapping của các question types cho mỗi bloom level
export const questionTypesByBloom: Record<BloomLevel, QuestionType[]> = {
  [BloomLevel.Remember]: [
    { id: "recall", name: "Recall", bloomLevel: BloomLevel.Remember, description: "Ghi nhớ và tái hiện thông tin" },
  ],
  [BloomLevel.Understand]: [
    { id: "Fill in the Blank", name: "Fill in the Blank", bloomLevel: BloomLevel.Understand, description: "Điền vào chỗ trống" },
  ],
  [BloomLevel.Apply]: [
    { id: "fill_in_the_blank", name: "Fill in the Blank", bloomLevel: BloomLevel.Apply, description: "Điền vào chỗ trống" },
    { id: "scenario_based", name: "Scenario Based", bloomLevel: BloomLevel.Apply, description: "Giải quyết vấn đề dựa trên tình huống" },
    { id: "correct_output", name: "Correct Output", bloomLevel: BloomLevel.Apply, description: "Xác định kết quả đầu ra chính xác" },
  ],
  [BloomLevel.Analyze]: [
    { id: "scenario_based", name: "Scenario Based", bloomLevel: BloomLevel.Analyze, description: "Phân tích tình huống" },
    { id: "correct_output", name: "Correct Output", bloomLevel: BloomLevel.Analyze, description: "Phân tích kết quả đầu ra" },
    { id: "code_analysis", name: "Code Analysis", bloomLevel: BloomLevel.Analyze, description: "Phân tích mã nguồn" },
  ],
  [BloomLevel.Evaluate]: [
    { id: "code_analysis", name: "Code Analysis", bloomLevel: BloomLevel.Evaluate, description: "Đánh giá và phê bình mã nguồn" },
  ],
  [BloomLevel.Create]: [],
};