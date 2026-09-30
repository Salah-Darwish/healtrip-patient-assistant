import { UrgencyLevel } from './triage.entity.js';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ToolCallExecution {
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
  durationMs: number;
}

export interface GroundingReport {
  isGrounded: boolean;
  verifiedEntityIds: string[];
  hallucinatedEntitiesDetected: string[];
  notes?: string;
}

export interface ChatMessageEntity {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCallExecution[];
  groundingReport?: GroundingReport;
  createdAt: Date;
}

export interface ChatSessionEntity {
  id: string;
  language: 'en' | 'ar';
  patientSummary?: string | null;
  urgencyLevel: UrgencyLevel;
  status: 'ACTIVE' | 'ARCHIVED' | 'ESCALATED_EMERGENCY';
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessageEntity[];
}
