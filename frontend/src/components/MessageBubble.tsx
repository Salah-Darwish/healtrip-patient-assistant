import React from 'react';
import { ShieldCheck, User, Bot, AlertCircle } from 'lucide-react';
import { Message, Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface MessageBubbleProps {
  message: Message;
  language: Language;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language }) => {
  const isAssistant = message.role === 'assistant';
  const t = translations[language];

  // Simple Markdown formatter for clinical text (bold, bullets, line breaks)
  const formatClinicalContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return <br key={idx} />;

      // Bullets
      if (line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleaned = line.replace(/^[•*-]\s*/, '');
        return (
          <li key={idx} dangerouslySetInnerHTML={{ __html: parseBold(cleaned) }} />
        );
      }

      return (
        <p key={idx} dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
      );
    });
  };

  const parseBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className={`message-item ${message.role}`}>
      <div className="avatar-badge">
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div className="bubble-wrapper">
        <div className="chat-bubble">
          {formatClinicalContent(message.content)}
        </div>

        {isAssistant && (
          <div className="bubble-meta">
            {message.urgencyLevel && (
              <span className={`triage-tag ${message.urgencyLevel.toLowerCase()}`}>
                <AlertCircle size={11} />
                {message.urgencyLevel.replace('_', ' ')}
              </span>
            )}

            {message.groundingReport?.isGrounded && (
              <span className="grounding-tag" title={t.groundedPass}>
                <ShieldCheck size={12} />
                {t.verifiedBadge}
              </span>
            )}

            <span>{message.timestamp}</span>
          </div>
        )}
      </div>
    </div>
  );
};
