import { ChatMessageEntity, ChatSessionEntity } from '../entities/chat.entity.js';
import { TriageAudit } from '../entities/triage.entity.js';

export interface IChatRepository {
  createSession(language: 'en' | 'ar'): Promise<ChatSessionEntity>;
  getSession(id: string): Promise<ChatSessionEntity | null>;
  updateSessionUrgency(id: string, urgency: string, status?: string): Promise<void>;
  addMessage(sessionId: string, message: Omit<ChatMessageEntity, 'id' | 'createdAt'>): Promise<ChatMessageEntity>;
  getSessionMessages(sessionId: string): Promise<ChatMessageEntity[]>;
  saveTriageAudit(audit: TriageAudit): Promise<void>;
}
