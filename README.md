# BloomAppGen - Quản lý Câu Hỏi Bloom

Chào mừng bạn đến với BloomAppGen! Đây là một ứng dụng web được xây dựng với React, TypeScript và Vite, được thiết kế để hỗ trợ quản lý và có thể là tạo câu hỏi dựa trên thang phân loại Bloom. Dự án này cung cấp một thiết lập tối thiểu để bắt đầu phát triển với các công cụ hiện đại, bao gồm Hot Module Replacement (HMR) và các quy tắc ESLint cơ bản.

## ✨ Công nghệ và Thư viện Chính

Dự án này được xây dựng và hỗ trợ bởi các công nghệ và thư viện sau:

*   **Framework/Library:** React 19
*   **Ngôn ngữ:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** TailwindCSS
*   **Icons:** Lucide React, Font Awesome
*   **Syntax Highlighting:** React Syntax Highlighter (sử dụng highlight.js)
*   **Linting:** ESLint với TypeScript ESLint, plugin React Hooks và React Refresh.
*   **Utilities:** UUID

## 🚀 Bắt đầu

Để chạy dự án này trên máy cục bộ của bạn, hãy làm theo các bước sau:

### Yêu cầu préal

*   Node.js: Phiên bản `>=22.0.0` (như được chỉ định trong `package.json`)
*   npm (hoặc yarn/pnpm)

### Cài đặt

1.  **Clone repository (nếu bạn chưa có):**
    ```bash
    git clone <your-repository-url>
    cd bloomappgen
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```
    (Hoặc `yarn install` hay `pnpm install` nếu bạn sử dụng chúng)

### Các lệnh Script chính

Dự án này đi kèm với các scripts sau được định nghĩa trong `package.json`:

*   **Chạy server phát triển:**
    ```bash
    npm run dev
    ```
    Mở [http://localhost:5173](http://localhost:5173) (hoặc cổng Vite chỉ định) để xem ứng dụng trong trình duyệt. Trang sẽ tự động tải lại nếu bạn thực hiện thay đổi.

*   **Build dự án cho production:**
    ```bash
    npm run build
    ```
    Lệnh này sẽ biên dịch TypeScript và build ứng dụng cho môi trường production vào thư mục `dist/`.

*   **Chạy ESLint để kiểm tra code:**
    ```bash
    npm run lint
    ```
    Kiểm tra các tệp trong dự án theo cấu hình ESLint.

*   **Xem trước bản build production:**
    ```bash
    npm run preview
    ```
    Lệnh này sẽ khởi động một server cục bộ để phục vụ các tệp từ thư mục `dist/`, cho phép bạn xem trước bản build production.

## ⚙️ Cấu hình ESLint

Cấu hình ESLint hiện tại (`eslint.config.js`) sử dụng:
*   `@eslint/js` cho các quy tắc JavaScript cơ bản.
*   `typescript-eslint` cho các quy tắc TypeScript.
*   `eslint-plugin-react-hooks` cho các quy tắc về React Hooks.
*   `eslint-plugin-react-refresh` cho tích hợp Fast Refresh.

### Mở rộng Cấu hình ESLint

Nếu bạn đang phát triển một ứng dụng production, chúng tôi khuyên bạn nên cập nhật cấu hình để kích hoạt các quy tắc lint nhận biết kiểu (type-aware lint rules):

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // ... các cấu hình khác
  {
    // ...
    extends: [
      // Xóa ...tseslint.configs.recommended và thay thế bằng
      ...tseslint.configs.recommendedTypeChecked,
      // Hoặc, sử dụng cái này cho các quy tắc nghiêm ngặt hơn
      // ...tseslint.configs.strictTypeChecked,
      // Tùy chọn, thêm cái này cho các quy tắc về phong cách
      // ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      // ... các tùy chọn khác
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'], // Điều chỉnh nếu cần
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // ...
  }
)