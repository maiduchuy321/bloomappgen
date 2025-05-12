// src/models/BloomLevel.ts

export const BloomLevel = {
  Remember: "Remember",
  Understand: "Understand",
  Apply: "Apply",
  Analyze: "Analyze",
  Evaluate: "Evaluate",
  Create: "Create",
} as const;

export type BloomLevel = typeof BloomLevel[keyof typeof BloomLevel];

export const bloomLevelLabels: Record<BloomLevel, string> = {
  [BloomLevel.Remember]: "Remember (Nhớ)",
  [BloomLevel.Understand]: "Understand (Hiểu)",
  [BloomLevel.Apply]: "Apply (Áp dụng)",
  [BloomLevel.Analyze]: "Analyze (Phân tích)",
  [BloomLevel.Evaluate]: "Evaluate (Đánh giá)",
  [BloomLevel.Create]: "Create (Sáng tạo)"
};
