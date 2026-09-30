import { IChatRepository } from '../../domain/repositories/chat.repository.interface.js';
import { AgentService } from '../../agent/agent.service.js';
import { AgentMessageInput } from '../../agent/providers/llm-provider.interface.js';
import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface.js';
import { IHospitalRepository } from '../../domain/repositories/hospital.repository.interface.js';
import { DoctorEntity } from '../../domain/entities/doctor.entity.js';
import { HospitalEntity } from '../../domain/entities/hospital.entity.js';

export interface ChatInteractionInput {
  sessionId?: string;
  message: string;
  language?: 'en' | 'ar';
}

export interface ChatInteractionOutput {
  sessionId: string;
  language: 'en' | 'ar';
  urgencyLevel: string;
  reply: string;
  suggestedQuestions: string[];
  recommendedDoctors: DoctorEntity[];
  recommendedHospitals: HospitalEntity[];
  toolExecutions: any[];
  groundingReport: any;
  telemetry: any;
}

export class OrchestrateChatUseCase {
  constructor(
    private readonly chatRepo: IChatRepository,
    private readonly doctorRepo: IDoctorRepository,
    private readonly hospitalRepo: IHospitalRepository,
    private readonly agentService: AgentService
  ) {}

  public async execute(input: ChatInteractionInput): Promise<ChatInteractionOutput> {
    const lang = input.language || 'en';

    // 1. Retrieve or Create Session
    let session = input.sessionId ? await this.chatRepo.getSession(input.sessionId) : null;
    if (!session) {
      session = await this.chatRepo.createSession(lang);
    }

    // 2. Persist User Message
    await this.chatRepo.addMessage(session.id, {
      sessionId: session.id,
      role: 'user',
      content: input.message,
    });

    // 3. Build History for Agent
    const history = await this.chatRepo.getSessionMessages(session.id);
    const agentMessages: AgentMessageInput[] = history.map(h => ({
      role: h.role,
      content: h.content,
    }));

    // 4. Process via Agent Service
    const agentOutput = await this.agentService.processPatientInteraction(
      session.id,
      agentMessages,
      lang
    );

    // 5. Persist Assistant Response with Tool Call Logs & Grounding Report
    await this.chatRepo.addMessage(session.id, {
      sessionId: session.id,
      role: 'assistant',
      content: agentOutput.reply,
      toolCalls: agentOutput.toolExecutions,
      groundingReport: agentOutput.groundingReport,
    });

    // 6. Update Session State & Urgency
    const newStatus = agentOutput.urgencyLevel === 'EMERGENCY' ? 'ESCALATED_EMERGENCY' : 'ACTIVE';
    await this.chatRepo.updateSessionUrgency(session.id, agentOutput.urgencyLevel, newStatus);

    // 7. Audit Log for clinical safety & compliance
    await this.chatRepo.saveTriageAudit({
      sessionId: session.id,
      rawInput: input.message,
      redFlags: agentOutput.telemetry.redFlagsDetected,
      urgencyScore: agentOutput.urgencyLevel === 'EMERGENCY' ? 5 : agentOutput.urgencyLevel === 'URGENT' ? 3 : 1,
      actionRecommended: agentOutput.urgencyLevel,
      overrodeByRule: agentOutput.telemetry.overrodeByRule,
    });

    // 8. Fetch Hydrated Verified Entities for Rich UI Cards
    const verifiedDoctorIds = agentOutput.groundingReport.verifiedEntityIds;
    const recommendedDoctors: DoctorEntity[] = [];
    for (const docId of verifiedDoctorIds) {
      const doc = await this.doctorRepo.findById(docId);
      if (doc) recommendedDoctors.push(doc);
    }

    const recommendedHospitals: HospitalEntity[] = [];
    for (const exec of agentOutput.toolExecutions) {
      if (exec.tool === 'search_hospitals' && Array.isArray(exec.output)) {
        for (const h of exec.output.slice(0, 3)) {
          if (h?.id) {
            const fullHosp = await this.hospitalRepo.findById(h.id);
            if (fullHosp) recommendedHospitals.push(fullHosp);
          }
        }
      }
    }

    return {
      sessionId: session.id,
      language: lang,
      urgencyLevel: agentOutput.urgencyLevel,
      reply: agentOutput.reply,
      suggestedQuestions: agentOutput.suggestedQuestions,
      recommendedDoctors,
      recommendedHospitals,
      toolExecutions: agentOutput.toolExecutions,
      groundingReport: agentOutput.groundingReport,
      telemetry: agentOutput.telemetry,
    };
  }
}
