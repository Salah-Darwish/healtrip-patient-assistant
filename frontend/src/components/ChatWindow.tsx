import React, { useEffect, useRef } from 'react';
import { Message, Language, Doctor } from '../types/index.js';
import { MessageBubble } from './MessageBubble.js';
import { ClarifyingOptions } from './ClarifyingOptions.js';
import { RecommendationsView } from './RecommendationsView.js';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  language: Language;
  onSelectOption: (option: string) => void;
  onRequestDoctorConsult: (doctor: Doctor) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  language,
  onSelectOption,
  onRequestDoctorConsult,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window">
      {messages.map((msg, idx) => {
        const isLatestAssistant = msg.role === 'assistant' && idx === messages.length - 1;

        return (
          <React.Fragment key={msg.id}>
            <MessageBubble message={msg} language={language} />

            {/* Recommendations cards */}
            {isLatestAssistant && (
              <>
                <RecommendationsView
                  doctors={msg.recommendedDoctors}
                  hospitals={msg.recommendedHospitals}
                  language={language}
                  onRequestDoctorConsult={onRequestDoctorConsult}
                />

                <ClarifyingOptions
                  options={msg.suggestedQuestions}
                  language={language}
                  onSelectOption={onSelectOption}
                  disabled={isLoading}
                />
              </>
            )}
          </React.Fragment>
        );
      })}

      {isLoading && (
        <div className="message-item assistant">
          <div className="avatar-badge">
            <span className="status-dot" style={{ background: 'white' }}></span>
          </div>
          <div className="chat-bubble" style={{ background: '#f8fafc' }}>
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
