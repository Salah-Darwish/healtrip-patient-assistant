import { Language, UrgencyLevel, Doctor, Hospital, ToolExecution, GroundingReport, TelemetryData } from '../types/index.js';

export interface SendMessageResponse {
  sessionId: string;
  language: Language;
  urgencyLevel: UrgencyLevel;
  reply: string;
  suggestedQuestions: string[];
  recommendedDoctors: Doctor[];
  recommendedHospitals: Hospital[];
  toolExecutions: ToolExecution[];
  groundingReport: GroundingReport;
  telemetry: TelemetryData;
}

const API_BASE = '/api';

export class ApiClient {
  public static async sendMessage(
    message: string,
    language: Language,
    sessionId?: string
  ): Promise<SendMessageResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        sessionId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Request failed with status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  }

  public static async checkHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }
}
