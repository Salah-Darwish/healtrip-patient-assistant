import React from 'react';
import { Stethoscope, Activity, Terminal, RotateCcw, Globe } from 'lucide-react';
import { Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenTelemetry: () => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenTelemetry,
  onResetSession,
}) => {
  const t = translations[language];

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon-box">
          <Stethoscope size={24} />
        </div>
        <div className="brand-titles">
          <h1>{t.appTitle}</h1>
          <p>{t.appSubtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="engine-status-badge">
          <span className="status-dot"></span>
          <span>{t.statusOnline}</span>
        </div>

        <button
          className="btn-secondary btn-telemetry"
          onClick={onOpenTelemetry}
          title={t.inspectTelemetry}
        >
          <Terminal size={15} />
          <span>{t.inspectTelemetry}</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => onLanguageChange(language === 'en' ? 'ar' : 'en')}
          title="Switch Language / تغيير اللغة"
        >
          <Globe size={15} />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onResetSession}
          title={t.resetSession}
        >
          <RotateCcw size={15} />
          <span>{t.resetSession}</span>
        </button>
      </div>
    </header>
  );
};
