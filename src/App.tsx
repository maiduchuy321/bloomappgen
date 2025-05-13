// src/App.tsx
import { ThemeProvider } from './contexts/ThemeContext';
import { QuestionProvider } from './contexts/question/QuestionProvider';
import { MainPage } from './pages/MainPage';

// Global styles & external libraries CSS
import './styles/variables.css';
import './styles/themes.css';
import './styles/global.css'; // Bao gồm reset, typography
// Base component styles (ví dụ)
import './styles/components/buttons.css';
import './styles/components/cards.css';
import './styles/components/form.css';
import './styles/components/toggle.css'; // Cho ThemeToggle

// Layout styles
import './styles/layout/container.css';
import './styles/layout/responsive.css';

// Font Awesome & Highlight.js
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'highlight.js/styles/atom-one-dark.min.css'; // Hoặc theme bạn chọn

function App() {
  return (
    <ThemeProvider>
      <QuestionProvider>
        <MainPage />
      </QuestionProvider>
    </ThemeProvider>
  );
}

export default App;