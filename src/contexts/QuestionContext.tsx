// src/contexts/QuestionContext.tsx
// File này định nghĩa một React Context để quản lý trạng thái và logic liên quan đến câu hỏi.
// Nó cung cấp các chức năng tải, lọc, thêm, sửa, xóa câu hỏi, và điều hướng giữa các câu hỏi.

// Nhập các hook và component cần thiết từ React
import React, { createContext, useState, useEffect, type ReactNode, useCallback, useContext } from 'react';

// Nhập các định nghĩa kiểu dữ liệu (models) cho câu hỏi, tùy chọn, cấu hình người dùng và ngữ cảnh khóa học
import type {
  Question, // Kiểu dữ liệu cho một câu hỏi
  QuestionOption, // Kiểu dữ liệu cho một tùy chọn của câu hỏi
  UserConfig, // Kiểu dữ liệu cho cấu hình lọc/hiển thị của người dùng
  CourseContext // Kiểu dữ liệu cho ngữ cảnh (thông tin khóa học/module) của câu hỏi
} from '../models/Question';

// Nhập định nghĩa về các loại câu hỏi theo cấp độ Bloom và kiểu QuestionType
import { questionTypesByBloom, type QuestionType } from '../models/QuestionType';
// Nhập định nghĩa về các cấp độ Bloom
import type { BloomLevel } from '../models/BloomLevel';

// --- HẰNG SỐ (CONSTANTS) ---
// Định nghĩa đường dẫn đến file JSON chứa dữ liệu câu hỏi mẫu.
const EXAMPLE_QUESTIONS_PATH = '../data_example/questions_Exemple_Bloom_Level.json';

// --- GIAO DIỆN (INTERFACES) CHO CONTEXT ---
// Định nghĩa kiểu dữ liệu cho giá trị mà QuestionContext sẽ cung cấp.
// Interface này mô tả các thuộc tính trạng thái và các hàm mà người dùng context có thể truy cập.
interface QuestionContextType {
  allQuestions: Question[]; // Mảng chứa tất cả các câu hỏi đã được tải, không bị lọc
  filteredQuestions: Question[]; // Mảng chứa các câu hỏi sau khi đã áp dụng bộ lọc
  currentQuestion: Question | null; // Câu hỏi hiện tại đang được hiển thị (null nếu không có câu hỏi nào)
  currentQuestionIndex: number; // Chỉ số (index) của câu hỏi hiện tại trong mảng filteredQuestions (-1 nếu không có câu hỏi nào)
  userConfig: UserConfig; // Cấu hình hiện tại của người dùng (lọc theo Bloom, loại câu hỏi,...)
  isLoading: boolean; // Trạng thái đang tải dữ liệu (true khi đang tải)
  error: string | null; // Thông báo lỗi nếu có (null nếu không có lỗi)

  // Các thao tác CRUD cơ bản (Tạo, Đọc, Cập nhật, Xóa)
  addQuestion: (question: Question) => void; // Hàm để thêm một câu hỏi mới
  updateQuestion: (id: string, updatedQuestion: Question) => void; // Hàm để cập nhật một câu hỏi dựa trên ID
  deleteQuestion: (id: string) => void; // Hàm để xóa một câu hỏi dựa trên ID
  deleteQuestionById: (id: string) => boolean; // Hàm để xóa một câu hỏi theo ID và trả về boolean (true nếu xóa thành công)

  // Chức năng đánh giá (Rating)
  rateQuestion: (id: string, rating: number) => void; // Hàm để cập nhật đánh giá cho một câu hỏi

  // Các thao tác với file
  loadQuestionsFromFile: (file: File) => Promise<number>; // Hàm để tải câu hỏi từ một đối tượng File (ví dụ: từ input type="file"), trả về số lượng câu hỏi đã tải
  loadExampleQuestions: () => Promise<number>; // Hàm để tải các câu hỏi mẫu từ đường dẫn định sẵn, trả về số lượng câu hỏi đã tải

  // Điều hướng và lọc
  setUserConfig: (config: Partial<UserConfig>) => void; // Hàm để cập nhật một phần hoặc toàn bộ cấu hình người dùng
  filterQuestions: (bloomLevel?: BloomLevel | '', questionType?: string, preserveIndex?: boolean) => void; // Hàm để áp dụng bộ lọc cho danh sách câu hỏi (theo Bloom, loại câu hỏi). Tùy chọn giữ nguyên index câu hỏi hiện tại.
  goToQuestion: (index: number) => void; // Hàm để chuyển đến một câu hỏi cụ thể theo chỉ số trong filteredQuestions
  nextQuestion: () => void; // Hàm để chuyển đến câu hỏi tiếp theo trong filteredQuestions
  prevQuestion: () => void; // Hàm để chuyển đến câu hỏi trước đó trong filteredQuestions

  // Các hàm tiện ích
  getUniqueBloomLevels: () => BloomLevel[]; // Hàm để lấy danh sách các cấp độ Bloom Level duy nhất có trong tất cả câu hỏi
  getUniqueQTypes: (selectedBloom?: BloomLevel | '') => string[]; // Hàm để lấy danh sách các loại câu hỏi duy nhất. Có thể lọc theo cấp độ Bloom Level được chọn.
  getQuestionById: (id: string) => Question | undefined; // Hàm để tìm và trả về một câu hỏi từ allQuestions dựa trên ID
}

// Tạo QuestionContext với giá trị mặc định là undefined.
// Khi sử dụng hook useContext(QuestionContext), nếu giá trị trả về là undefined,
// điều đó có nghĩa hook không được sử dụng bên trong QuestionProvider.
export const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// --- HÀM HỖ TRỢ CHO VIỆC CHUẨN HÓA DỮ LIỆU ---
// Hàm này chuẩn hóa dữ liệu tùy chọn câu hỏi từ các định dạng khác nhau sang định dạng mảng QuestionOption[] chuẩn.
// Dữ liệu đầu vào có thể là object { A: "text", B: "text" } hoặc array of strings ["text A", "text B"].
function normalizeOptionsArray(optionsData: any, correctAnswerKey?: string): QuestionOption[] {
  const options: QuestionOption[] = []; // Mảng lưu các tùy chọn đã được chuẩn hóa
  // Kiểm tra nếu dữ liệu tùy chọn là object và không phải null, không phải mảng
  if (typeof optionsData === 'object' && optionsData !== null && !Array.isArray(optionsData)) {
    // Chuyển đổi từ object { A: "text", B: "text" } sang mảng QuestionOption[]
    Object.entries(optionsData).forEach(([key, value]) => {
      // Chỉ xử lý nếu giá trị là string
      if (typeof value === 'string') {
        options.push({ id: key, text: value }); // Thêm tùy chọn vào mảng kết quả
      }
    });
  } else if (Array.isArray(optionsData)) {
    // Nếu dữ liệu là mảng các chuỗi ["text A", "text B"]
    optionsData.forEach((optText, i) => {
      // Chỉ xử lý nếu giá trị là string
      if (typeof optText === 'string') {
        const letter = String.fromCharCode(65 + i); // Tạo ID tự động (A, B, C...)
        options.push({ id: letter, text: optText }); // Thêm tùy chọn vào mảng kết quả
      }
    });
  }
  return options; // Trả về mảng tùy chọn đã chuẩn hóa
}

// Hàm này chuẩn hóa một đối tượng câu hỏi thô (từ JSON) sang định dạng Question chuẩn.
// Nó xử lý các tên thuộc tính khác nhau có thể có trong dữ liệu thô và áp dụng các giá trị mặc định.
function normalizeQuestion(rawQ: any, index: number): Question {
  // Lấy ID đáp án đúng, xử lý các tên thuộc tính khác nhau
  const correctAnswerId = String(rawQ.correct_answer || rawQ.correctAnswer || '');

  // Lấy cấp độ Bloom, xử lý tên thuộc tính
  const bloomLevel = (rawQ.bloom_level || null) as BloomLevel | null;
  // Lấy tên loại câu hỏi, xử lý các tên thuộc tính khác nhau
  let qTypeName = rawQ.q_type || rawQ.Question_type || rawQ.question_type || '';

  // Nếu có cả Bloom Level và Loại câu hỏi, thử chuẩn hóa tên loại câu hỏi dựa trên Bloom Level
  if (bloomLevel && qTypeName) {
    const qTypesForBloom = questionTypesByBloom[bloomLevel]; // Lấy danh sách loại câu hỏi hợp lệ cho Bloom Level này
    // Tìm loại câu hỏi trong danh sách hợp lệ dựa trên tên hoặc ID
    const foundQType = qTypesForBloom?.find(qt => qt.name === qTypeName || qt.id === qTypeName);
    if (foundQType) {
      qTypeName = foundQType.name; // Chuẩn hóa tên loại câu hỏi thành tên (Name)
    }
  }

  // Tạo đối tượng Question đã chuẩn hóa
  const normalized: Question = {
    // ID câu hỏi: Ưu tiên rawQ.number (nếu là số hợp lệ), sau đó là rawQ.id, cuối cùng là ID tự sinh
    id: String(rawQ.number !== undefined && !isNaN(parseInt(rawQ.number)) ? rawQ.number : (rawQ.id || `gen_${Date.now()}_${index}`)),
    // Số thứ tự câu hỏi: Ưu tiên rawQ.id (chuyển sang số), sau đó là rawQ.number (chuyển sang số), cuối cùng là index + 1
    number: parseInt(String(rawQ.id || rawQ.number || index + 1), 10),
    // Nội dung câu hỏi: Ưu tiên rawQ.question, sau đó là rawQ.text, mặc định là "[Chưa có nội dung câu hỏi]"
    text: rawQ.question || rawQ.text || '[Chưa có nội dung câu hỏi]',
    // Chuẩn hóa tùy chọn câu hỏi bằng hàm normalizeOptionsArray
    options: normalizeOptionsArray(rawQ.options, correctAnswerId),
    // ID đáp án đúng đã lấy ở trên
    correctAnswerId: correctAnswerId,
    // Cấp độ Bloom: Sử dụng bloomLevel đã xử lý, mặc định là BloomLevel.Remember
    bloomLevel: bloomLevel || BloomLevel.Remember,
    // Loại câu hỏi: Sử dụng qTypeName đã xử lý
    questionType: qTypeName,
    // Giải thích: Lấy từ rawQ.explanation
    explanation: rawQ.explanation,
    // Ngữ cảnh (CourseContext): Lấy thông tin khóa học/module, cung cấp giá trị mặc định
    context: {
      courseTitle: rawQ.course_title || rawQ.courseTitle || 'Chưa có tiêu đề khóa học',
      courseDescription: rawQ.course_descrisption || rawQ.courseDescription || 'Chưa có mô tả khóa học',
      moduleNumber: rawQ.Module || rawQ.moduleNumber || rawQ.module || null,
    },
    // Tokens Input/Output (thông tin cho LLM): Chuyển sang số nếu tồn tại
    tokensInput: rawQ.tokensIn !== undefined ? parseInt(rawQ.tokensIn) : undefined,
    tokensOutput: rawQ.tokensOut !== undefined ? parseInt(rawQ.tokensOut) : undefined,
    // Đánh giá (Rating): Chuyển sang số nếu tồn tại
    rating: rawQ.rating !== undefined ? parseInt(rawQ.rating) : undefined,
    // Thông tin được tạo bởi LLM (genbyLLM): Chuyển sang boolean nếu tồn tại, mặc định là true
    genbyLLM: rawQ.genbyLLM !== undefined ? Boolean(rawQ.genbyLLM) : true,
  };
  return normalized; // Trả về câu hỏi đã chuẩn hóa
}

// --- COMPONENT PROVIDER ---
// Định nghĩa kiểu props cho QuestionProvider. Nó nhận các ReactNode làm children
// và tùy chọn một mảng câu hỏi ban đầu.
interface QuestionProviderProps {
  children: ReactNode; // Các phần tử con mà Provider bao bọc
  initialQuestions?: Question[]; // Mảng câu hỏi ban đầu (tùy chọn)
}

// QuestionProvider là một component bao bọc cung cấp QuestionContext cho các component con.
// Nó quản lý trạng thái về câu hỏi và cung cấp các hàm để tương tác với trạng thái đó.
export const QuestionProvider: React.FC<QuestionProviderProps> = ({
  children,
  initialQuestions = [] // Gán giá trị mặc định cho initialQuestions là mảng rỗng
}) => {
  // --- TRẠNG THÁI (STATE) ---

  // Sử dụng useState để quản lý các phần trạng thái của context.
  const [allQuestions, setAllQuestions] = useState<Question[]>(initialQuestions); // Trạng thái lưu tất cả câu hỏi
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(initialQuestions); // Trạng thái lưu các câu hỏi đã lọc
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(initialQuestions.length > 0 ? 0 : -1); // Trạng thái lưu chỉ số câu hỏi hiện tại trong filteredQuestions
  const [userConfig, setUserConfigState] = useState<UserConfig>({ // Trạng thái lưu cấu hình người dùng
    bloomLevel: '', // Mặc định không lọc theo Bloom Level
    questionType: '', // Mặc định không lọc theo Loại câu hỏi
    numQuestions: 10, // Số lượng câu hỏi mặc định (chưa dùng trong logic lọc hiện tại nhưng có thể dùng sau này)
  });
  const [isLoading, setIsLoading] = useState(false); // Trạng thái tải dữ liệu
  const [error, setError] = useState<string | null>(null); // Trạng thái lỗi


  // Hàm tiện ích để lấy câu hỏi hiện tại từ filteredQuestions dựa trên currentQuestionIndex.
  // Định nghĩa sớm để có thể sử dụng trong các hàm khác.
  const getCurrentQuestion = () => {
    return (currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length)
      ? filteredQuestions[currentQuestionIndex] // Trả về câu hỏi nếu index hợp lệ
      : null; // Trả về null nếu index không hợp lệ hoặc filteredQuestions rỗng
  };


  // Hàm nội bộ (helper) để xử lý dữ liệu câu hỏi thô và cập nhật cả allQuestions và filteredQuestions.
  // Sử dụng useCallback để ghi nhớ hàm này, tránh tạo lại hàm mới không cần thiết trong mỗi lần render
  // trừ khi các dependency thay đổi.
  const processAndSetQuestionsInternal = useCallback((rawData: any[], source: string) => {
    setIsLoading(true); // Bắt đầu quá trình tải, đặt isLoading thành true
    try {
      // Chuẩn hóa dữ liệu thô thành mảng Question[]
      const normalized = rawData.map((q, i) => normalizeQuestion(q, i));
      setAllQuestions(normalized); // Cập nhật trạng thái allQuestions

      // Áp dụng bộ lọc hiện tại (từ userConfig) để tạo filteredQuestions
      let tempFiltered = [...normalized]; // Bắt đầu với tất cả câu hỏi đã chuẩn hóa
      // Lọc theo Bloom Level nếu có trong userConfig
      if (userConfig.bloomLevel) {
        tempFiltered = tempFiltered.filter(q => q.bloomLevel === userConfig.bloomLevel);
      }
      // Lọc theo Loại câu hỏi nếu có trong userConfig
      if (userConfig.questionType) {
        tempFiltered = tempFiltered.filter(q => q.questionType === userConfig.questionType);
      }

      setFilteredQuestions(tempFiltered); // Cập nhật trạng thái filteredQuestions
      // Đặt lại chỉ số câu hỏi hiện tại về 0 nếu có câu hỏi sau khi lọc, ngược lại đặt -1
      setCurrentQuestionIndex(tempFiltered.length > 0 ? 0 : -1);
      setError(null); // Xóa thông báo lỗi cũ
      console.log(`[QuestionContext] Đã xử lý ${normalized.length} câu hỏi từ nguồn '${source}'.`); // Log thông báo
      return normalized.length; // Trả về số lượng câu hỏi đã xử lý
    } catch (e) {
      // Xử lý lỗi nếu có trong quá trình xử lý
      const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định khi xử lý câu hỏi.";
      setError(`Lỗi xử lý dữ liệu từ '${source}': ${errorMessage}`); // Đặt thông báo lỗi
      console.error(`[QuestionContext] Lỗi xử lý dữ liệu từ '${source}':`, e); // Log lỗi chi tiết
      // Reset trạng thái về rỗng nếu xảy ra lỗi
      setAllQuestions([]);
      setFilteredQuestions([]);
      setCurrentQuestionIndex(-1);
      return 0; // Trả về 0 câu hỏi đã xử lý
    } finally {
      setIsLoading(false); // Kết thúc quá trình tải, đặt isLoading thành false
    }
  }, [userConfig.bloomLevel, userConfig.questionType]); // Dependencies: Hàm này phụ thuộc vào các giá trị lọc trong userConfig

  // --- CÁC THAO TÁC CRUD ---

  // Hàm thêm một câu hỏi mới vào hệ thống.
  const addQuestion = (question: Question) => {
    // Thêm câu hỏi mới vào cuối mảng allQuestions
    setAllQuestions(prev => [...prev, question]);

    // Kiểm tra xem câu hỏi mới có khớp với bộ lọc hiện tại không
    let shouldAdd = true;
    if (userConfig.bloomLevel && question.bloomLevel !== userConfig.bloomLevel) {
      shouldAdd = false;
    }
    if (userConfig.questionType && question.questionType !== userConfig.questionType) {
      shouldAdd = false;
    }

    // Nếu câu hỏi mới khớp với bộ lọc, thêm nó vào filteredQuestions
    if (shouldAdd) {
      setFilteredQuestions(prev => [...prev, question]);
      // Nếu trước đó không có câu hỏi nào được chọn (index = -1), chọn câu hỏi mới được thêm vào
      if (currentQuestionIndex === -1) {
        // filteredQuestions.length ở đây là số lượng phần tử *trước* khi thêm câu hỏi mới,
        // nên chỉ số của câu hỏi mới sẽ bằng chiều dài đó.
        setCurrentQuestionIndex(filteredQuestions.length);
      }
    }
  };


  // Hàm cập nhật thông tin của một câu hỏi dựa trên ID của nó.
  const updateQuestion = (id: string, updatedQuestion: Question) => {
    // Cập nhật câu hỏi trong mảng allQuestions
    setAllQuestions(prev =>
      prev.map(q => q.id === id ? updatedQuestion : q) // Tìm câu hỏi theo ID và thay thế bằng updatedQuestion
    );

    // Cập nhật câu hỏi trong mảng filteredQuestions nếu nó có mặt
    setFilteredQuestions(prev => {
      const isInFiltered = prev.some(q => q.id === id); // Kiểm tra xem câu hỏi có trong danh sách đã lọc không

      // Nếu câu hỏi có trong danh sách đã lọc, cập nhật nó
      if (isInFiltered) {
        return prev.map(q => q.id === id ? updatedQuestion : q);
      }

      // Nếu câu hỏi không có trong danh sách đã lọc, kiểm tra xem nó có khớp với bộ lọc hiện tại sau khi cập nhật không
      const matchesFilters = (
        (!userConfig.bloomLevel || updatedQuestion.bloomLevel === userConfig.bloomLevel) &&
        (!userConfig.questionType || updatedQuestion.questionType === userConfig.questionType)
      );

      // Nếu nó khớp, thêm nó vào danh sách đã lọc
      if (matchesFilters) {
        return [...prev, updatedQuestion];
      }

      // Nếu không có gì thay đổi liên quan đến filteredQuestions, trả về mảng cũ
      return prev;
    });
  };


  // Hàm xóa một câu hỏi dựa trên ID của nó.
  const deleteQuestion = (id: string) => {
    // Lọc bỏ câu hỏi khỏi mảng allQuestions
    setAllQuestions(prev => prev.filter(q => q.id !== id));

    // Xóa câu hỏi khỏi mảng filteredQuestions và điều chỉnh currentQuestionIndex nếu cần
    const currentQ = getCurrentQuestion(); // Lấy câu hỏi hiện tại trước khi xóa
    const wasInFiltered = filteredQuestions.some(q => q.id === id); // Kiểm tra xem câu hỏi có trong danh sách đã lọc không
    if (wasInFiltered) { // Chỉ xử lý filteredQuestions nếu câu hỏi bị xóa có trong đó
      setFilteredQuestions(prev => {
        const newFiltered = prev.filter(q => q.id !== id); // Lọc bỏ câu hỏi khỏi filteredQuestions

        // Điều chỉnh chỉ số câu hỏi hiện tại
        if (currentQ && currentQ.id === id) {
          // Nếu câu hỏi hiện tại bị xóa, đặt lại chỉ số
          setCurrentQuestionIndex(newFiltered.length > 0 ?
            Math.min(currentQuestionIndex, newFiltered.length - 1) // Chọn chỉ số hiện tại hoặc chỉ số cuối cùng nếu danh sách bị thu nhỏ
            : -1); // Nếu danh sách rỗng, đặt -1
        } else {
           // Nếu câu hỏi hiện tại không bị xóa nhưng một câu hỏi *trước* nó bị xóa,
           // index của câu hỏi hiện tại có thể bị thay đổi.
           // Tìm lại vị trí của câu hỏi hiện tại trong danh sách mới.
           const newCurrentIndex = newFiltered.findIndex(q => q.id === currentQ?.id);
           if (newCurrentIndex !== -1) {
             setCurrentQuestionIndex(newCurrentIndex);
           } else {
             // Trường hợp hiếm: câu hỏi hiện tại bị xóa nhưng currentQ chưa được cập nhật kịp, hoặc lỗi logic khác.
             // Đặt lại về đầu danh sách hoặc -1.
             setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
           }
        }

        return newFiltered; // Trả về mảng filteredQuestions mới
      });
    }
  };


  // Một hàm khác để xóa câu hỏi theo ID, trả về boolean. Logic tương tự deleteQuestion
  // nhưng cách xử lý cập nhật state và trả về giá trị hơi khác.
  const deleteQuestionById = (id: string): boolean => {
    const initialLength = allQuestions.length; // Lưu lại số lượng câu hỏi ban đầu
    // Tạo mảng allQuestions mới bằng cách lọc bỏ câu hỏi
    const newAllQuestions = allQuestions.filter(q => q.id !== id);
    const currentQ = getCurrentQuestion(); // Lấy câu hỏi hiện tại

    // Kiểm tra xem có câu hỏi nào bị xóa không (dựa vào chiều dài mảng)
    if (newAllQuestions.length < initialLength) {
      setAllQuestions(newAllQuestions); // Cập nhật allQuestions

      // Cập nhật filteredQuestions và currentQuestionIndex
      const newFiltered = filteredQuestions.filter(q => q.id !== id); // Lọc bỏ câu hỏi khỏi filteredQuestions
      setFilteredQuestions(newFiltered); // Cập nhật filteredQuestions

      // Điều chỉnh chỉ số câu hỏi hiện tại
      if (currentQ && currentQ.id === id) { // Nếu câu hỏi đang xem bị xóa
        setCurrentQuestionIndex(newFiltered.length > 0 ?
          Math.min(currentQuestionIndex, newFiltered.length - 1) : -1);
      } else {
        // Nếu câu hỏi hiện tại không bị xóa, tìm lại index của nó trong danh sách mới
        const oldIndexInFiltered = filteredQuestions.findIndex(q => q.id === currentQ?.id);
        if (oldIndexInFiltered !== -1) {
          const newCurrentIndex = newFiltered.findIndex(q => q.id === currentQ?.id);
          setCurrentQuestionIndex(newCurrentIndex); // Cập nhật index mới
        } else {
          // Nếu câu hỏi hiện tại không còn trong danh sách mới (có thể do lỗi logic hoặc xóa mục khác),
          // đặt lại index về đầu hoặc -1.
          setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
        }
      }
      return true; // Trả về true vì đã xóa thành công
    }
    return false; // Trả về false vì không tìm thấy câu hỏi để xóa
  };

  // --- CHỨC NĂNG ĐÁNH GIÁ ---

  // Hàm cập nhật đánh giá (rating) cho một câu hỏi cụ thể.
  const rateQuestion = (id: string, rating: number) => {
    // Lưu lại chỉ số câu hỏi hiện tại và ID để có thể tìm lại sau khi state update
    const currentQ = getCurrentQuestion();
    const currentId = currentQ?.id;

    // Cập nhật rating trong allQuestions
    setAllQuestions(prev => prev.map(q => q.id === id ? { ...q, rating } : q));

    // Cập nhật rating trong filteredQuestions nhưng giữ nguyên thứ tự (map sẽ làm điều này)
    setFilteredQuestions(prev => {
      const updatedQuestions = prev.map(q => q.id === id ? { ...q, rating } : q);

      // Tìm lại vị trí câu hỏi hiện tại sau khi cập nhật filteredQuestions.
      // Sử dụng setTimeout 0 để đảm bảo React đã hoàn thành việc cập nhật state filteredQuestions
      // trước khi tìm lại index, tránh race condition.
      if (currentId) {
        const newCurrentIndex = updatedQuestions.findIndex(q => q.id === currentId);
        if (newCurrentIndex !== -1) {
          setTimeout(() => {
            setCurrentQuestionIndex(newCurrentIndex);
          }, 0);
        }
      }

      return updatedQuestions;
    });

    // Có thể thêm logic lưu rating vào localStorage hoặc API ở đây nếu cần
    // localStorage.setItem(`rating_${id}`, String(rating));
  };

  // --- CÁC THAO TÁC VỚI FILE ---

  // Hàm tải câu hỏi từ một đối tượng File (thường nhận từ input type="file").
  // Đây là một hàm bất đồng bộ (async) trả về Promise.
  const loadQuestionsFromFile = async (file: File): Promise<number> => {
    setIsLoading(true); // Bắt đầu tải
    setError(null); // Xóa lỗi cũ

    // Trả về một Promise để có thể theo dõi quá trình tải và xử lý kết quả/lỗi
    return new Promise<number>((resolve, reject) => {
      const reader = new FileReader(); // Tạo đối tượng FileReader để đọc nội dung file

      // Xử lý sự kiện khi file được đọc thành công
      reader.onload = (event) => {
        try {
          // Lấy nội dung file (dạng string)
          const fileContent = event.target?.result as string;
          // Parse nội dung string thành đối tượng/mảng JSON
          const jsonData = JSON.parse(fileContent);

          // Kiểm tra xem dữ liệu JSON có phải là mảng không
          if (!Array.isArray(jsonData)) {
            throw new Error("Dữ liệu JSON không phải là một mảng.");
          }

          // Xử lý và đặt câu hỏi vào state bằng hàm nội bộ
          const count = processAndSetQuestionsInternal(jsonData, `file-${file.name}`);
          resolve(count); // Hoàn thành Promise với số lượng câu hỏi đã xử lý
        } catch (e) {
          // Xử lý lỗi trong quá trình parse JSON hoặc xử lý dữ liệu
          const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định.";
          setError(`Lỗi parse file JSON: ${errorMessage}`);
          console.error("[QuestionContext] Lỗi parse file JSON:", e);
          setIsLoading(false);
          reject(e); // Từ chối Promise với lỗi
        }
      };

      // Xử lý sự kiện khi xảy ra lỗi đọc file
      reader.onerror = () => {
        setError("Lỗi đọc file.");
        console.error("[QuestionContext] Lỗi đọc file:", reader.error);
        setIsLoading(false);
        reject(new Error("Lỗi đọc file")); // Từ chối Promise với lỗi đọc file
      };

      // Bắt đầu đọc file dưới dạng text
      reader.readAsText(file);
    });
  };


  // Hàm tải các câu hỏi mẫu từ đường dẫn cố định (EXAMPLE_QUESTIONS_PATH).
  // Đây là một hàm bất đồng bộ (async) trả về Promise.
  // Sử dụng useCallback để ghi nhớ hàm này.
  const loadExampleQuestions = useCallback(async (): Promise<number> => {
    setIsLoading(true); // Bắt đầu tải
    setError(null); // Xóa lỗi cũ

    try {
      // Sử dụng fetch API để tải file JSON mẫu
      const response = await fetch(EXAMPLE_QUESTIONS_PATH);

      // Kiểm tra phản hồi HTTP có thành công không
      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status} khi tải file ví dụ.`);
      }

      // Parse phản hồi thành JSON
      const data = await response.json();

      // Kiểm tra xem dữ liệu JSON có phải là mảng không
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu JSON ví dụ không phải là một mảng.");
      }

      // Xử lý và đặt câu hỏi vào state bằng hàm nội bộ
      return processAndSetQuestionsInternal(data, 'example-on-demand');
    } catch (e) {
      // Xử lý lỗi trong quá trình tải hoặc xử lý dữ liệu
      const errorMessage = e instanceof Error ? e.message : "Lỗi không xác định.";
      setError(`Lỗi tải dữ liệu mẫu: ${errorMessage}`);
      console.error("[QuestionContext] Lỗi tải dữ liệu mẫu:", e);
      // Nếu có lỗi, reset câu hỏi về rỗng và đặt lỗi
      processAndSetQuestionsInternal([], 'example-error');
      setIsLoading(false);
      throw e; // Ném lại lỗi để component gọi có thể bắt được
    }
  }, [processAndSetQuestionsInternal]); // Dependency: Phụ thuộc vào hàm processAndSetQuestionsInternal

  // --- ĐIỀU HƯỚNG VÀ LỌC ---

  // Hàm cập nhật cấu hình người dùng (ví dụ: thay đổi bộ lọc Bloom Level hoặc Question Type).
  const setUserConfig = (config: Partial<UserConfig>) => {
    // Cập nhật trạng thái userConfig bằng cách merge config mới vào trạng thái cũ
    setUserConfigState(prev => ({ ...prev, ...config }));
    // Việc cập nhật này sẽ kích hoạt useEffect bên dưới để áp dụng bộ lọc mới.
  };


  // Hàm áp dụng bộ lọc cho danh sách câu hỏi.
  // Sử dụng useCallback để ghi nhớ hàm này, vì nó là dependency của useEffect.
  const filterQuestions = useCallback((
    bloomLevel?: BloomLevel | '', // Cấp độ Bloom để lọc (tùy chọn)
    questionType?: string, // Loại câu hỏi để lọc (tùy chọn)
    preserveIndex: boolean = false // Tham số tùy chọn: có cố gắng giữ nguyên chỉ số câu hỏi hiện tại không
  ) => {
    // Lưu lại ID câu hỏi hiện tại để có thể tìm lại sau khi lọc
    const currentQ = getCurrentQuestion();
    const currentId = currentQ?.id;

    // Tạo mảng filteredQuestions mới bằng cách lọc từ mảng allQuestions
    let newFiltered = [...allQuestions]; // Bắt đầu với tất cả câu hỏi

    // Áp dụng lọc theo Bloom Level nếu bloomLevel được cung cấp và không rỗng
    if (bloomLevel) {
      newFiltered = newFiltered.filter(q => q.bloomLevel === bloomLevel);
    }

    // Áp dụng lọc theo Loại câu hỏi nếu questionType được cung cấp và không rỗng
    if (questionType) {
      newFiltered = newFiltered.filter(q => q.questionType === questionType);
    }

    setFilteredQuestions(newFiltered); // Cập nhật trạng thái filteredQuestions

    // Xác định chỉ số câu hỏi hiện tại mới sau khi lọc
    if (preserveIndex && currentId) {
      // Nếu yêu cầu giữ nguyên index và có ID câu hỏi hiện tại, tìm lại vị trí của nó trong danh sách mới
      const newIndex = newFiltered.findIndex(q => q.id === currentId);
      if (newIndex !== -1) {
        // Nếu tìm thấy câu hỏi hiện tại trong danh sách mới, đặt currentQuestionIndex bằng index mới
        setCurrentQuestionIndex(newIndex);
      } else {
        // Nếu không tìm thấy (câu hỏi hiện tại bị lọc ra), đặt lại chỉ số về câu hỏi đầu tiên (hoặc -1 nếu rỗng)
        setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
      }
    } else {
      // Nếu không yêu cầu giữ nguyên index (hoặc không có câu hỏi hiện tại), đặt lại chỉ số về câu hỏi đầu tiên (hoặc -1 nếu rỗng)
      setCurrentQuestionIndex(newFiltered.length > 0 ? 0 : -1);
    }
  }, [allQuestions]); // Dependency: Hàm này phụ thuộc vào mảng allQuestions


  // Sử dụng useEffect để theo dõi sự thay đổi của userConfig.
  // Khi userConfig thay đổi, hàm filterQuestions sẽ được gọi để cập nhật filteredQuestions.
  useEffect(() => {
    // Áp dụng bộ lọc từ userConfig.
    // Tham số true cuối cùng yêu cầu cố gắng giữ nguyên câu hỏi đang xem nếu nó vẫn còn sau khi lọc.
    filterQuestions(userConfig.bloomLevel, userConfig.questionType, true);
  }, [userConfig, filterQuestions]); // Dependencies: Effect chạy lại khi userConfig hoặc filterQuestions thay đổi


  // Hàm chuyển đến một câu hỏi cụ thể theo chỉ số trong filteredQuestions.
  const goToQuestion = (index: number) => {
    // Kiểm tra xem chỉ số có hợp lệ trong phạm vi của filteredQuestions không
    if (index >= 0 && index < filteredQuestions.length) {
      setCurrentQuestionIndex(index); // Cập nhật chỉ số
    } else if (filteredQuestions.length === 0) {
      setCurrentQuestionIndex(-1); // Nếu danh sách rỗng, đặt -1
    }
    // Các chỉ số không hợp lệ khác sẽ bị bỏ qua
  };


  // Hàm chuyển đến câu hỏi tiếp theo trong filteredQuestions.
  const nextQuestion = () => {
    // Kiểm tra xem có câu hỏi tiếp theo không
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1); // Tăng chỉ số hiện tại
    }
  };


  // Hàm chuyển đến câu hỏi trước đó trong filteredQuestions.
  const prevQuestion = () => {
    // Kiểm tra xem có câu hỏi trước đó không
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1); // Giảm chỉ số hiện tại
    }
  };

  // --- CÁC HÀM TIỆN ÍCH ---

  // Hàm lấy danh sách các cấp độ Bloom Level duy nhất có trong tất cả các câu hỏi.
  // Sử dụng useCallback để ghi nhớ hàm này.
  const getUniqueBloomLevels = useCallback((): BloomLevel[] => {
    // Tạo một Set từ các bloomLevel của allQuestions để loại bỏ giá trị trùng lặp và null/undefined
    const levels = new Set(allQuestions.map(q => q.bloomLevel).filter(Boolean as any as (level: BloomLevel | null) => level is BloomLevel));
    // Chuyển Set thành mảng và sắp xếp
    return Array.from(levels).sort();
  }, [allQuestions]); // Dependency: Hàm này phụ thuộc vào mảng allQuestions


  // Hàm lấy danh sách các loại câu hỏi duy nhất. Có thể lọc theo cấp độ Bloom được chọn.
  // Sử dụng useCallback để ghi nhớ hàm này.
  const getUniqueQTypes = useCallback((selectedBloom?: BloomLevel | ''): string[] => {
    let relevantQTypes: QuestionType[] = [];

    // Nếu một cấp độ Bloom cụ thể được chọn, lấy các loại câu hỏi hợp lệ cho cấp độ đó từ questionTypesByBloom
    if (selectedBloom && questionTypesByBloom[selectedBloom]) {
      relevantQTypes = questionTypesByBloom[selectedBloom];
    } else if (!selectedBloom) {
      // Nếu không có cấp độ Bloom nào được chọn (hoặc được truyền rỗng), lấy tất cả các loại câu hỏi có trong dữ liệu allQuestions
      const allQTypeIdsFromData = new Set(allQuestions.map(q => q.questionType).filter(Boolean)); // Lấy ID loại câu hỏi duy nhất từ dữ liệu
      return Array.from(allQTypeIdsFromData).sort(); // Chuyển Set thành mảng và sắp xếp
    }

    // Nếu một cấp độ Bloom được chọn, trả về ID của các loại câu hỏi hợp lệ và sắp xếp
    return relevantQTypes.map(qt => qt.id).sort();
  }, [allQuestions]); // Dependency: Hàm này phụ thuộc vào mảng allQuestions (khi selectedBloom không được truyền)


  // Hàm tìm và trả về một câu hỏi từ mảng allQuestions dựa trên ID của nó.
  // Sử dụng useCallback để ghi nhớ hàm này.
  const getQuestionById = useCallback((id: string): Question | undefined => {
    return allQuestions.find(q => q.id === id); // Sử dụng phương thức find của mảng
  }, [allQuestions]); // Dependency: Hàm này phụ thuộc vào mảng allQuestions


  // Tính toán giá trị của currentQuestion dựa trên currentQuestionIndex và filteredQuestions.
  // Giá trị này sẽ được đưa vào context value.
  const currentQuestion = (currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length)
    ? filteredQuestions[currentQuestionIndex] // Lấy câu hỏi từ filteredQuestions nếu index hợp lệ
    : null; // Trả về null nếu index không hợp lệ


  // Trả về QuestionContext.Provider component.
  // Prop 'value' chứa tất cả state và hàm mà các component con sử dụng hook useQuestions có thể truy cập.
  return (
    <QuestionContext.Provider value={{
      allQuestions, // Mảng tất cả câu hỏi
      filteredQuestions, // Mảng câu hỏi đã lọc
      currentQuestion, // Câu hỏi hiện tại đang xem
      currentQuestionIndex, // Chỉ số câu hỏi hiện tại
      userConfig, // Cấu hình người dùng
      isLoading, // Trạng thái tải
      error, // Thông báo lỗi

      // Các hàm CRUD
      addQuestion,
      updateQuestion,
      deleteQuestion,
      deleteQuestionById,

      // Hàm đánh giá
      rateQuestion,

      // Các hàm thao tác file
      loadQuestionsFromFile,
      loadExampleQuestions,

      // Các hàm điều hướng và lọc
      setUserConfig,
      filterQuestions,
      goToQuestion,
      nextQuestion,
      prevQuestion,

      // Các hàm tiện ích
      getUniqueBloomLevels,
      getUniqueQTypes,
      getQuestionById,
    }}>
      {children} {/* Render các component con bên trong Provider */}
    </QuestionContext.Provider>
  );
};

// Hook tùy chỉnh (custom hook) để dễ dàng truy cập QuestionContext.
// Các component chỉ cần gọi useQuestions() thay vì useContext(QuestionContext).
export const useQuestions = () => {
  // Sử dụng hook useContext để lấy giá trị từ QuestionContext
  const context = useContext(QuestionContext);
  // Kiểm tra xem hook có được sử dụng bên trong QuestionProvider không.
  // Nếu không, context sẽ là undefined và chúng ta ném ra lỗi để cảnh báo người dùng.
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context; // Trả về giá trị context (QuestionContextType)
};