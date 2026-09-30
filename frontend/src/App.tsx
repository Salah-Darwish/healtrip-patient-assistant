import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { TriageAlertBanner } from './components/TriageAlertBanner.js';
import { ChatWindow } from './components/ChatWindow.js';
import { ChatInput } from './components/ChatInput.js';
import { SystemTelemetryDrawer } from './components/SystemTelemetryDrawer.js';
import { ApiClient } from './services/api.client.js';
import { Message, Language, UrgencyLevel, Doctor, TelemetryData, GroundingReport, ToolExecution } from './types/index.js';
import { translations } from './i18n/translations.js';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('ROUTINE');
  const [isLoading, setIsLoading] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // Telemetry inspection state
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryData | undefined>(undefined);
  const [currentGrounding, setCurrentGrounding] = useState<GroundingReport | undefined>(undefined);
  const [currentTools, setCurrentTools] = useState<ToolExecution[] | undefined>(undefined);

  // Initial welcome message
  const getInitialMessages = (lang: Language): Message[] => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        lang === 'ar'
          ? `مرحبًا بك في **HealTrip AI Patient Decision Assistant**.\n\nأنا مساعدك السريري الذكي لتوجيه قرارات الرعاية الصحية. إذا كنت تشعر بأعراض مثل **ألم في الصدر**، أو محتار بين زيارة طبيب قلب، أو التوجه للطوارئ، أو طلب **رأي طبي ثانٍ** لجراحة أو قسطرة، يسعدني مساعدتك.\n\n*كيف يمكنني مساعدتك اليوم؟*`
          : `Welcome to the **HealTrip AI Patient Decision Assistant**.\n\nI am your clinical decision support guide. If you are experiencing symptoms like **chest pain** and weighing whether to visit an outpatient cardiologist, head to the Emergency Room (ER), or seek a cross-border **second opinion** for catheterization or surgery, I am here to guide you through evidence-grounded triage.\n\n*How are you feeling today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgencyLevel: 'ROUTINE',
      suggestedQuestions:
        lang === 'ar'
          ? [
              'أعاني من ألم في الصدر ولست متأكدًا أين أتوجه',
              'ألم شديد بالصدر يمتد للذراع وضيق تنفس',
              'أرغب برأي ثانٍ من ألمانيا لعملية قسطرة ودعامات',
            ]
          : [
              'I have chest pain and I’m not sure whether I should see a cardiologist, go to the ER, or seek a second opinion.',
              'Severe chest pain radiating to my arm with shortness of breath',
              'Looking for an international second opinion on bypass vs stent in Germany',
            ],
    },
  ];

  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages('en'));

  // Update HTML dir and lang attributes on language toggle
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    // If only welcome message exists, update it to the selected language
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages(getInitialMessages(newLang));
    }
  };

  const handleResetSession = () => {
    setSessionId(undefined);
    setUrgencyLevel('ROUTINE');
    setCurrentTelemetry(undefined);
    setCurrentGrounding(undefined);
    setCurrentTools(undefined);
    setMessages(getInitialMessages(language));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ApiClient.sendMessage(text, language, sessionId);

      setSessionId(response.sessionId);
      setUrgencyLevel(response.urgencyLevel);
      setCurrentTelemetry(response.telemetry);
      setCurrentGrounding(response.groundingReport);
      setCurrentTools(response.toolExecutions);

      const assistantMessage: Message = {
        id: `assist-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgencyLevel: response.urgencyLevel,
        suggestedQuestions: response.suggestedQuestions,
        recommendedDoctors: response.recommendedDoctors,
        recommendedHospitals: response.recommendedHospitals,
        toolExecutions: response.toolExecutions,
        groundingReport: response.groundingReport,
        telemetry: response.telemetry,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'ar'
            ? `⚠️ عذرًا، حدث خطأ أثناء معالجة طلبك: ${err.message}. يرجى المحاولة مرة أخرى.`
            : `⚠️ Sorry, an error occurred while processing your clinical request: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDoctorConsult = (doctor: Doctor) => {
    const docName = language === 'ar' ? doctor.nameAr : doctor.nameEn;
    const requestText =
      language === 'ar'
        ? `أرغب بحجز استشارة رأي طبي ثانٍ مع ${docName} ومراجعة ملفاتي التشخيصية.`
        : `I would like to request a second opinion consultation with ${docName} and review my diagnostic files.`;

    handleSendMessage(requestText);
  };

  const t = translations[language];

  return (
    <div className="app-container">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        onResetSession={handleResetSession}
      />

      <main className="app-main">
        {urgencyLevel === 'EMERGENCY' && (
          <TriageAlertBanner language={language} />
        )}

        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          language={language}
          onSelectOption={handleSendMessage}
          onRequestDoctorConsult={handleRequestDoctorConsult}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          language={language}
        />
      </main>

      <footer className="app-footer">
        <p>{t.disclaimer}</p>
      </footer>

      <SystemTelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        telemetry={currentTelemetry}
        groundingReport={currentGrounding}
        toolExecutions={currentTools}
        language={language}
      />
    </div>
  );
};
