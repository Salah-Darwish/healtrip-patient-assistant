import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface ClarifyingOptionsProps {
  options?: string[];
  language: Language;
  onSelectOption: (option: string) => void;
  disabled?: boolean;
}

export const ClarifyingOptions: React.FC<ClarifyingOptionsProps> = ({
  options,
  language,
  onSelectOption,
  disabled,
}) => {
  if (!options || options.length === 0) return null;
  const t = translations[language];

  return (
    <div className="clarifying-section">
      <div className="clarifying-label">
        <HelpCircle size={13} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: '4px' }} />
        <span>{t.clarifyingHeader}</span>
      </div>
      <div className="clarifying-chips">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className="chip-btn"
            disabled={disabled}
            onClick={() => onSelectOption(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
