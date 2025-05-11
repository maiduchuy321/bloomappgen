// src/components/shared/ContentRenderer.tsx
import React from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { escapeHtml } from '../../utils/formatters'; // Assuming escapeHtml is here

interface ContentRendererProps {
  text: string;
  keyPrefix: string; // Dùng làm prefix cho key để tránh trùng lặp khi render list
}

// Helper function để render văn bản với inline code và code blocks
export const ContentRenderer: React.FC<ContentRendererProps> = ({ text, keyPrefix }) => {
  if (!text) return null;

  const parts: (JSX.Element | string)[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g; // Regex cho code blocks

  let lastIndex = 0;
  let match;
  let partIndex = 0;

  // Tách text thành các phần: text thường và code blocks
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Text trước code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Code block
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext', // Ngôn ngữ hoặc mặc định plaintext
      content: match[2].trim() // Nội dung code block, trim khoảng trắng thừa
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Text sau code block cuối cùng
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  // Render các phần, xử lý inline code trong các phần text
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          // Xử lý inline code và ngắt dòng trong phần text
          const inlineCodeRegex = /`([^`]+)`/g;
          const textParts: (JSX.Element | string)[] = [];
          let inlineLastIndex = 0;
          let inlineMatch;
          let inlinePartIndex = 0;

          const textSegment = part.content;

          while ((inlineMatch = inlineCodeRegex.exec(textSegment)) !== null) {
            // Văn bản trước inline code
            if (inlineMatch.index > inlineLastIndex) {
              const textBefore = textSegment.substring(inlineLastIndex, inlineMatch.index);
               textParts.push(
                <span
                   key={`${keyPrefix}-text-${index}-part-${inlinePartIndex}`}
                   dangerouslySetInnerHTML={{ __html: escapeHtml(textBefore).replace(/\n/g, '<br />') }}
                />
              );
              inlinePartIndex++;
            }

            // Inline code
            textParts.push(
              <code key={`${keyPrefix}-text-${index}-part-${inlinePartIndex}`} className="inline-code">
                {escapeHtml(inlineMatch[1])} {/* Escape content inside code tag */}
              </code>
            );
            inlineLastIndex = inlineCodeRegex.lastIndex;
            inlinePartIndex++;
          }

          // Văn bản còn lại sau inline code cuối cùng
          if (inlineLastIndex < textSegment.length) {
             const textAfter = textSegment.substring(inlineLastIndex);
             textParts.push(
               <span
                 key={`${keyPrefix}-text-${index}-part-${inlinePartIndex}`}
                 dangerouslySetInnerHTML={{ __html: escapeHtml(textAfter).replace(/\n/g, '<br />') }}
               />
             );
          }

          // Wrap text parts in a div to maintain block structure if needed, or just return the array
          // Using a div might add extra spacing; returning array is often fine for inline/block flow
          return <React.Fragment key={`${keyPrefix}-text-segment-${index}`}>{textParts}</React.Fragment>;


        } else { // part.type === 'code'
          return (
            <SyntaxHighlighter
              key={`${keyPrefix}-code-segment-${index}`}
              language={part.language.toLowerCase()}
              style={materialDark}
              showLineNumbers
              wrapLines
              PreTag="div" // Sử dụng div thay cho pre để tránh lỗi hydration nếu cần và dễ style
              className="code-block-highlighter" // Thêm class để style container
            >
              {part.content}
            </SyntaxHighlighter>
          );
        }
      })}
    </>
  );
};