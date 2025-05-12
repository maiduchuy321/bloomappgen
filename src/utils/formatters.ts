// utils/formatters.ts

/**
 * Escape HTML characters to prevent XSS attacks
 * @param text Text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(text: any): string {
  // Kiểm tra nếu text là null hoặc undefined
  if (text === null || text === undefined) return '';
  
  // Chuyển đổi thành chuỗi nếu text không phải là chuỗi
  const stringText = typeof text === 'string' ? text : String(text);
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return stringText.replace(/[&<>"']/g, (m) => map[m]);
}
  
  /**
   * Formats code blocks in text, converting markdown ```code``` blocks
   * to HTML with proper formatting
   * @param text Text containing markdown code blocks
   * @returns HTML formatted text with code blocks
   */
  export function formatCodeBlocks(text: string): string {
    if (!text) return '';
    
    // Tách và xử lý các code block
    return text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
      return `<pre class="code-block ${language ? `language-${language}` : ''}"><code>${escapeHtml(code)}</code></pre>`;
    });
  }
  
  /**
   * Formats inline code in text, converting markdown `code` to HTML <code> tags
   * @param text Text containing inline code
   * @returns HTML formatted text with inline code tags
   */
  export function formatInlineCode(text: string): string {
    if (!text) return '';
    
    // Xử lý inline code được đánh dấu bằng dấu ``
    return text.replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  
  /**
   * Fully format text with all available formatters
   * @param text Raw text to format
   * @returns Fully formatted HTML
   */
  export function formatFullText(text: string): string {
    if (!text) return '';
    
    let formatted = escapeHtml(text);
    formatted = formatCodeBlocks(formatted);
    formatted = formatInlineCode(formatted);
    
    return formatted;
  }