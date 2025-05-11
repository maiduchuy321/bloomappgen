// src/components/ConfigTab/ConfigForm.tsx
import React, { useState, ChangeEvent, useEffect, FormEvent } from 'react';
import { useQuestions } from '../../contexts/QuestionContext'; // Sử dụng hook mới
import { Select } from '../shared/Select';
import { Button } from '../shared/Button';
import { BloomLevel, bloomLevelLabels } from '../../models/BloomLevel';
import { questionTypesByBloom, QuestionType as AppQuestionType } from '../../models/QuestionType';
import { UserConfig } from '../../models/Question';

// ConfigTab.css đã được import trong ConfigTab.tsx hoặc App.tsx

const ConfigForm: React.FC = () => {
  const {
    userConfig: globalConfig,
    setUserConfig: setGlobalUserConfig,
    loadQuestionsFromFile,
    loadExampleQuestions,
    filterQuestions: applyGlobalFilter, // từ QuestionContext
    isLoading, // Lấy isLoading từ context
    error: contextError, // Lấy error từ context
  } = useQuestions();

  const [localConfig, setLocalConfig] = useState<UserConfig>(globalConfig);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileNameDisplay, setFileNameDisplay] = useState<string>("Chưa chọn file");
  const [qTypeHint, setQTypeHint] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null); // Lỗi cục bộ của form

  useEffect(() => {
    setLocalConfig(globalConfig);
  }, [globalConfig]);

  useEffect(() => {
    if (localConfig.bloomLevel && questionTypesByBloom[localConfig.bloomLevel]) {
      const hint = questionTypesByBloom[localConfig.bloomLevel]
        .map(qt => `${qt.name}: ${qt.description || 'Không có mô tả'}`)
        .join('; ');
      setQTypeHint(hint);
    } else {
      setQTypeHint('');
    }
  }, [localConfig.bloomLevel]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFormError(null); // Reset form error
    if (file) {
      if (file.type === "application/json") {
        setSelectedFile(file);
        setFileNameDisplay(`Sẵn sàng tải: ${file.name}`);
      } else {
        setSelectedFile(null);
        setFileNameDisplay("Lỗi: Chỉ chấp nhận file .json");
        setFormError("Vui lòng chọn file có định dạng .json");
        event.target.value = ''; // Reset input
      }
    } else {
      setSelectedFile(null);
      setFileNameDisplay("Chưa chọn file");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const key = id.startsWith('config-') ? id.substring('config-'.length).replace(/-level$/, 'Level') : id;

    setLocalConfig(prev => {
      const newConfig = {
        ...prev,
        [key]: type === 'number' ? parseInt(value, 10) : value,
      };
      if (key === 'bloomLevel') {
        newConfig.questionType = ''; // Reset Q-Type
      }
      return newConfig;
    });
  };

  const handleSubmitConfig = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setGlobalUserConfig(localConfig); // Cập nhật config global

    if (selectedFile) {
      try {
        const count = await loadQuestionsFromFile(selectedFile);
        alert(`Đã ghi nhận cấu hình.\nĐã tải THÀNH CÔNG ${count} câu hỏi từ ${selectedFile.name}.`);
        setSelectedFile(null);
        setFileNameDisplay("Chưa chọn file");
        // Không cần gọi refreshViewTab và renderQuestionList vì QuestionContext sẽ tự cập nhật
        // và các component con sẽ re-render.
        // switchTab('view'); // Việc chuyển tab sẽ do MainPage quản lý
      } catch (err) {
        const loadError = err instanceof Error ? err.message : "Lỗi không xác định khi tải file.";
        setFormError(`Lỗi tải file: ${loadError}`);
        alert(`Đã ghi nhận cấu hình.\nLỖI khi tải dữ liệu từ file: ${loadError}`);
      }
    } else {
      alert(`Đã ghi nhận cấu hình (không có file mới được tải).\nBloom: ${localConfig.bloomLevel || 'Tất cả'}\nQ-Type: ${localConfig.questionType || 'Tất cả'}`);
      applyGlobalFilter(localConfig.bloomLevel, localConfig.questionType);
    }
  };

  const handleLoadExample = async () => {
    setFormError(null);
    setSelectedFile(null);
    setFileNameDisplay("Đang tải ví dụ...");
    try {
      const count = await loadExampleQuestions();
      alert(`Đã tải ${count} câu hỏi ví dụ.`);
      setFileNameDisplay("Đã tải dữ liệu ví dụ");
      // Config inputs có thể được reset hoặc cập nhật dựa trên dữ liệu ví dụ
      setLocalConfig(prev => ({ ...prev, bloomLevel: '', questionType: ''})); // Reset filter
    } catch (err) {
      const loadError = err instanceof Error ? err.message : "Lỗi không xác định khi tải ví dụ.";
      setFormError(`Lỗi tải ví dụ: ${loadError}`);
      setFileNameDisplay("Lỗi tải dữ liệu ví dụ");
      alert(`Lỗi khi tải câu hỏi ví dụ: ${loadError}`);
    }
  };

  const bloomOptions = [
    { value: "", label: "-- Tất cả / Không áp dụng --" },
    ...(Object.values(BloomLevel) as BloomLevel[]).map(level => ({
      value: level,
      label: bloomLevelLabels[level]
    }))
  ];

  const qTypeOptionsForSelect = (localConfig.bloomLevel && questionTypesByBloom[localConfig.bloomLevel])
    ? [
        { value: "", label: "-- Tất cả / Không áp dụng --" },
        ...questionTypesByBloom[localConfig.bloomLevel].map((qt: AppQuestionType) => ({ value: qt.id, label: qt.name }))
      ]
    : [{ value: "", label: "-- Chọn Bloom trước --", disabled: true }];

  return (
    <form className="config-card" onSubmit={handleSubmitConfig}>
      <h2><i className="fas fa-sliders-h"></i> Thông tin cấu hình</h2>
      {(formError || contextError) && <p className="error-message">{formError || contextError}</p>}
      {isLoading && <p className="loading-message">Đang xử lý...</p>}

      <div className="config-item">
        <label htmlFor="file-upload-input"><i className="fas fa-file-upload"></i> Upload File (JSON):</label>
        <div className="file-upload-container">
          <input type="file" id="file-upload-input" accept=".json" onChange={handleFileChange} />
          <label htmlFor="file-upload-input" className="file-upload-label">
            <i className="fas fa-cloud-upload-alt"></i> Chọn file
          </label>
          <span id="file-name-display">{fileNameDisplay}</span>
        </div>
      </div>

      <div className="config-item">
        <Select
          id="config-bloomLevel" // Thay đổi id để khớp key trong localConfig
          label={<><i className="fas fa-layer-group"></i> Chọn thang Bloom:</>}
          options={bloomOptions}
          value={localConfig.bloomLevel || ""}
          onChange={(val) => handleInputChange({ target: { id: 'config-bloomLevel', value: val, type: 'select-one' } } as any)}
        />
      </div>

      <div className="config-item">
        <Select
          id="config-questionType" // Thay đổi id
          label={<><i className="fas fa-tag"></i> Loại câu hỏi (Q-type):</>}
          options={qTypeOptionsForSelect}
          value={localConfig.questionType || ""}
          onChange={(val) => handleInputChange({ target: { id: 'config-questionType', value: val, type: 'select-one' } } as any)}
          disabled={!localConfig.bloomLevel || qTypeOptionsForSelect.length <= 1}
        />
        {qTypeHint && <small className="hint" style={{whiteSpace: 'pre-line'}}>{qTypeHint}</small>}
      </div>

      <div className="config-item">
        <label htmlFor="config-numQuestions"><i className="fas fa-sort-numeric-up"></i> Số lượng câu hỏi (tham khảo):</label>
        <input
          type="number"
          id="config-numQuestions" // Thay đổi id
          value={localConfig.numQuestions}
          min="1"
          onChange={handleInputChange}
        />
      </div>

      <div className="button-group">
        <Button type="submit" variant="primary" disabled={isLoading}>
          <i className="fas fa-check"></i> Xác nhận cấu hình
        </Button>
        <Button type="button" variant="secondary" onClick={handleLoadExample} disabled={isLoading}>
          <i className="fas fa-vial"></i> Tải Ví Dụ
        </Button>
      </div>
    </form>
  );
};

export default ConfigForm;

