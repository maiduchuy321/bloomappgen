// src/components/shared/CodeBlock.tsx
import React from 'react';
import { escapeHtml } from '../../utils/formatters';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  // Kiểm tra xem có code block hay không
  if (!code.includes('```')) {
    return <div dangerouslySetInnerHTML={{ __html: escapeHtml(code) }} />;
  }

  // Phân tách text và code blocks
  const parts = [];
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = codeRegex.exec(code)) !== null) {
    // Text trước code block
    if (match.index > lastIndex) {
      const textPart = code.substring(lastIndex, match.index);
      parts.push(
        <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: escapeHtml(textPart) }} />
      );
    }

    // Code block
    const language = match[1] || 'plaintext'; // Nếu không có ngôn ngữ thì mặc định là plaintext
    const codeContent = match[2];
    parts.push(
      <pre key={`code-${index}`} className={`code-block language-${language}`}>
        <code>{codeContent}</code>
      </pre>
    );

    lastIndex = match.index + match[0].length;
    index++;
  }

  // Text còn lại sau code block cuối cùng
  if (lastIndex < code.length) {
    const textPart = code.substring(lastIndex);
    parts.push(
      <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: escapeHtml(textPart) }} />
    );
  }

  return <>{parts}</>;
};
