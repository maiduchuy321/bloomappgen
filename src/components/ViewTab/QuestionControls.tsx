// src/components/ViewTab/QuestionControls.tsx
import React, { useMemo } from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';
import {  BloomLevel, bloomLevelLabels } from '../../models/BloomLevel';
import { questionTypesByBloom, type QuestionType as AppQuestionType } from '../../models/QuestionType'; // Model QuestionType
import './QuestionControls.css'; // CSS riêng

export const QuestionControls: React.FC = () => {
  const {
    filteredQuestions,
    currentQuestionIndex,
    userConfig,
    setUserConfig, // Dùng setUserConfig để cập nhật config global
    filterQuestions, // Dùng filterQuestions từ context
    prevQuestion,
    nextQuestion,
    getUniqueBloomLevels, // Lấy bloom levels từ context (dựa trên dữ liệu)
    // getUniqueQTypes,    // Lấy qtypes từ context
  } = useQuestions();

  const currentBloomFilter = userConfig.bloomLevel || "";
  const currentQTypeFilter = userConfig.questionType || "";

  // Options cho Bloom Select - lấy từ enum
  const bloomOptions = useMemo(() => [
    { value: "", label: "Tất cả Bloom" },
    ...(Object.values(BloomLevel) as BloomLevel[]).map(level => ({
      value: level,
      label: bloomLevelLabels[level]
    }))
  ], []);

  // Options cho Q-Type Select, dựa vào Bloom đã chọn
  const qTypeOptions = useMemo(() => {
    if (!currentBloomFilter || !questionTypesByBloom[currentBloomFilter as BloomLevel]) {
      return [{ value: "", label: "Tất cả Q-Type", disabled: true }];
    }
    const typesForBloom: AppQuestionType[] = questionTypesByBloom[currentBloomFilter as BloomLevel];
    return [
      { value: "", label: "Tất cả Q-Type" },
      ...typesForBloom.map(qt => ({ value: qt.id, label: qt.name }))
    ];
  }, [currentBloomFilter]);

  const handleBloomChange = (value: string) => {
    const newBloomLevel = value as BloomLevel | '';
    setUserConfig({ bloomLevel: newBloomLevel, questionType: '' }); // Cập nhật context, reset Q-Type
    // filterQuestions sẽ được gọi tự động bởi useEffect trong QuestionContext khi userConfig thay đổi
  };

  const handleQTypeChange = (value: string) => {
    setUserConfig({ questionType: value }); // Cập nhật context
  };

  return (
    <div className="question-controls">
      <div className="pagination view-pagination">
        <Button
          onClick={prevQuestion}
          disabled={currentQuestionIndex <= 0 || filteredQuestions.length === 0}
          className="control-btn"
        >
          <i className="fas fa-chevron-left"></i>
        </Button>
        <span id="question-counter">
          Câu hỏi {filteredQuestions.length > 0 ? currentQuestionIndex + 1 : 0}/{filteredQuestions.length}
        </span>
        <Button
          onClick={nextQuestion}
          disabled={currentQuestionIndex >= filteredQuestions.length - 1 || filteredQuestions.length === 0}
          className="control-btn"
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
      </div>
      <div className="question-filters">
        <Select
          id="filter-bloom"
          options={bloomOptions}
          value={currentBloomFilter}
          onChange={handleBloomChange}
          compact
        />
        <Select
          id="filter-q-type"
          options={qTypeOptions}
          value={currentQTypeFilter}
          onChange={handleQTypeChange}
          disabled={!currentBloomFilter || qTypeOptions.length <= 1}
          compact
        />
      </div>
    </div>
  );
};