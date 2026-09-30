import React from 'react';
import { X, Activity, ShieldCheck, Database, Wrench, Clock, Cpu } from 'lucide-react';
import { ToolExecution, GroundingReport, TelemetryData, Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface SystemTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry?: TelemetryData;
  groundingReport?: GroundingReport;
  toolExecutions?: ToolExecution[];
  language: Language;
}

export const SystemTelemetryDrawer: React.FC<SystemTelemetryDrawerProps> = ({
  isOpen,
  onClose,
  telemetry,
  groundingReport,
  toolExecutions,
  language,
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="telemetry-overlay" onClick={onClose}>
      <div className="telemetry-drawer" onClick={e => e.stopPropagation()}>
        <div className="telemetry-header">
          <div className="telemetry-title">
            <h2>{t.telemetryTitle}</h2>
            <p>{t.telemetrySubtitle}</p>
          </div>
          <button className="btn-close-drawer" onClick={onClose} title={t.close}>
            <X size={18} />
          </button>
        </div>

        <div className="telemetry-body">
          {/* Performance & Core Metrics */}
          <div className="telemetry-card">
            <div className="telemetry-card-title">
              <Activity size={14} />
              <span>System & Pipeline Telemetry</span>
            </div>

            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">{t.llmProvider}</div>
                <div className="metric-val" style={{ textTransform: 'uppercase' }}>
                  {telemetry?.providerUsed || 'simulation'}
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">{t.latency}</div>
                <div className="metric-val">
                  {telemetry ? `${telemetry.latencyMs} ms` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Pre-Triage Rule Engine */}
          <div className="telemetry-card">
            <div className="telemetry-card-title">
              <Cpu size={14} />
              <span>Layer 1: Pre-Triage Rule Engine (Safety)</span>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                {t.redFlagCheck}
              </div>
              {telemetry?.redFlagsDetected && telemetry.redFlagsDetected.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {telemetry.redFlagsDetected.map((rf, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ {rf}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#34d399' }}>
                  ✓ {t.noRedFlags}
                </span>
              )}
            </div>
          </div>

          {/* Anti-Hallucination & Grounding Guardrail */}
          <div className="telemetry-card">
            <div className="telemetry-card-title">
              <ShieldCheck size={14} />
              <span>Layer 3: Anti-Hallucination Guardrail</span>
            </div>

            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Entity Grounding Status</div>
                <div className={`metric-val ${groundingReport?.isGrounded ? 'pass' : 'danger'}`}>
                  {groundingReport?.isGrounded ? 'VERIFIED 100%' : 'FLAGGED & SANITIZED'}
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-label">Verified DB Entity IDs</div>
                <div className="metric-val" style={{ fontSize: '0.85rem' }}>
                  {groundingReport?.verifiedEntityIds?.length || 0} Entities
                </div>
              </div>
            </div>

            {groundingReport?.verifiedEntityIds && groundingReport.verifiedEntityIds.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Matched IDs: <code style={{ color: '#38bdf8' }}>{groundingReport.verifiedEntityIds.join(', ')}</code>
              </div>
            )}
          </div>

          {/* Deterministic Tool Executions */}
          <div className="telemetry-card">
            <div className="telemetry-card-title">
              <Wrench size={14} />
              <span>{t.toolsExecuted}</span>
            </div>

            {toolExecutions && toolExecutions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {toolExecutions.map((exec, idx) => (
                  <div key={idx} className="tool-execution-block">
                    <div className="tool-meta-row">
                      <span className="tool-name-badge">⚡ {exec.tool}()</span>
                      <span className="tool-duration">
                        <Clock size={11} style={{ display: 'inline', marginInlineEnd: '2px' }} />
                        {exec.durationMs}ms
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        {t.toolInput}
                      </div>
                      <pre className="json-viewer">{JSON.stringify(exec.input, null, 2)}</pre>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        {t.toolOutput}
                      </div>
                      <pre className="json-viewer">{JSON.stringify(exec.output, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {t.noTools}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
