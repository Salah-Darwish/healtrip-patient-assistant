import React from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import { Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface TriageAlertBannerProps {
  language: Language;
}

export const TriageAlertBanner: React.FC<TriageAlertBannerProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="emergency-banner" role="alert">
      <div className="emergency-content">
        <AlertTriangle size={22} />
        <span>{t.emergencyNotice}</span>
      </div>
      <a href="tel:911" className="emergency-btn">
        <PhoneCall size={16} />
        <span>{t.emergencyCallBtn}</span>
      </a>
    </div>
  );
};
