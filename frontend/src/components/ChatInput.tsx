import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  language: Language;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  language,
}) => {
  const [input, setInput] = useState('');
  const t = translations[language];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const scenarios = [
    t.scenario1,
    t.scenario2,
    t.scenario3,
  ];

  return (
    <div className="chat-input-container">
      <div className="sample-scenarios">
        <div className="sample-scenarios-title">
          <Sparkles size={12} style={{ display: 'inline', marginInlineEnd: '4px', color: 'var(--color-accent)' }} />
          <span>{t.sampleQuestionsTitle}</span>
        </div>
        <div className="scenario-pills">
          {scenarios.map((scen, idx) => (
            <button
              key={idx}
              className="scenario-pill"
              onClick={() => onSendMessage(scen)}
              disabled={isLoading}
            >
              {scen}
            </button>
          ))}
        </div>
      </div>

      <form className="input-row" onSubmit={handleSubmit}>
        <textarea
          className="chat-textarea"
          rows={2}
          value={input}
          placeholder={t.inputPlaceholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          <span>{t.sendBtn}</span>
        </button>
      </form>
    </div>
  );
};
