// src/models/BloomLevel.ts
export enum BloomLevel {
    Remember = "Remember",
    Understand = "Understand",
    Apply = "Apply",
    Analyze = "Analyze",
    Evaluate = "Evaluate",
    Create = "Create"
  }
  
  export const bloomLevelLabels: Record<BloomLevel, string> = {
    [BloomLevel.Remember]: "Remember (Nhớ)",
    [BloomLevel.Understand]: "Understand (Hiểu)",
    [BloomLevel.Apply]: "Apply (Áp dụng)",
    [BloomLevel.Analyze]: "Analyze (Phân tích)",
    [BloomLevel.Evaluate]: "Evaluate (Đánh giá)",
    [BloomLevel.Create]: "Create (Sáng tạo)"
  };
  
  
  
  