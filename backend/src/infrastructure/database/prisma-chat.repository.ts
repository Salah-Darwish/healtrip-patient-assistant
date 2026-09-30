import { prisma } from './prisma.client.js';
import { IChatRepository } from '../../domain/repositories/chat.repository.interface.js';
import { ChatMessageEntity, ChatSessionEntity } from '../../domain/entities/chat.entity.js';
import { TriageAudit, UrgencyLevel } from '../../domain/entities/triage.entity.js';

export class PrismaChatRepository implements IChatRepository {
  public async createSession(language: 'en' | 'ar'): Promise<ChatSessionEntity> {
    const session = await prisma.chatSession.create({
      data: {
        language,
        urgencyLevel: 'ROUTINE',
        status: 'ACTIVE',
      },
    });

    return {
      id: session.id,
      language: session.language as 'en' | 'ar',
      patientSummary: session.patientSummary,
      urgencyLevel: session.urgencyLevel as UrgencyLevel,
      status: session.status as 'ACTIVE' | 'ARCHIVED' | 'ESCALATED_EMERGENCY',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: [],
    };
  }

  public async getSession(id: string): Promise<ChatSessionEntity | null> {
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) return null;

    return {
      id: session.id,
      language: session.language as 'en' | 'ar',
      patientSummary: session.patientSummary,
      urgencyLevel: session.urgencyLevel as UrgencyLevel,
      status: session.status as 'ACTIVE' | 'ARCHIVED' | 'ESCALATED_EMERGENCY',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messages: session.messages.map(m => ({
        id: m.id,
        sessionId: m.sessionId,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        toolCalls: m.toolCallsJson ? JSON.parse(m.toolCallsJson) : undefined,
        groundingReport: {
          isGrounded: m.grounded,
          verifiedEntityIds: m.verifiedEntityIds ? m.verifiedEntityIds.split(',').filter(Boolean) : [],
          hallucinatedEntitiesDetected: [],
        },
        createdAt: m.createdAt,
      })),
    };
  }

  public async updateSessionUrgency(id: string, urgency: string, status?: string): Promise<void> {
    await prisma.chatSession.update({
      where: { id },
      data: {
        urgencyLevel: urgency,
        ...(status ? { status } : {}),
      },
    });
  }

  public async addMessage(
    sessionId: string,
    message: Omit<ChatMessageEntity, 'id' | 'createdAt'>
  ): Promise<ChatMessageEntity> {
    const created = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: message.role,
        content: message.content,
        toolCallsJson: message.toolCalls ? JSON.stringify(message.toolCalls) : null,
        grounded: message.groundingReport?.isGrounded ?? true,
        verifiedEntityIds: message.groundingReport?.verifiedEntityIds.join(','),
      },
    });

    return {
      id: created.id,
      sessionId: created.sessionId,
      role: created.role as 'user' | 'assistant' | 'system',
      content: created.content,
      toolCalls: message.toolCalls,
      groundingReport: message.groundingReport,
      createdAt: created.createdAt,
    };
  }

  public async getSessionMessages(sessionId: string): Promise<ChatMessageEntity[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map(m => ({
      id: m.id,
      sessionId: m.sessionId,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      toolCalls: m.toolCallsJson ? JSON.parse(m.toolCallsJson) : undefined,
      groundingReport: {
        isGrounded: m.grounded,
        verifiedEntityIds: m.verifiedEntityIds ? m.verifiedEntityIds.split(',').filter(Boolean) : [],
        hallucinatedEntitiesDetected: [],
      },
      createdAt: m.createdAt,
    }));
  }

  public async saveTriageAudit(audit: TriageAudit): Promise<void> {
    await prisma.triageAuditLog.create({
      data: {
        sessionId: audit.sessionId,
        rawInput: audit.rawInput,
        redFlags: JSON.stringify(audit.redFlags),
        urgencyScore: audit.urgencyScore,
        actionRecommended: audit.actionRecommended,
        overrodeByRule: audit.overrodeByRule,
      },
    });
  }
}
