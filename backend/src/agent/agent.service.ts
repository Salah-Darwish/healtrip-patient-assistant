import { ILlmProvider, AgentMessageInput, AgentGenerationResult } from './providers/llm-provider.interface.js';
import { IAgentTool } from './tools/base.tool.js';
import { SearchDoctorsTool } from './tools/search-doctors.tool.js';
import { SearchHospitalsTool } from './tools/search-hospitals.tool.js';
import { EvaluateUrgencyTool } from './tools/evaluate-urgency.tool.js';
import { EstimateSecondOpinionTool } from './tools/estimate-second-opinion.tool.js';
import { AntiHallucinationGuard } from '../application/guardrails/anti-hallucination.guard.js';
import { RedFlagsRuleEngine } from '../application/guardrails/red-flags.rule-engine.js';
import { IDoctorRepository } from '../domain/repositories/doctor.repository.interface.js';
import { IHospitalRepository } from '../domain/repositories/hospital.repository.interface.js';
import { GroundingReport, ToolCallExecution } from '../domain/entities/chat.entity.js';
import { UrgencyLevel } from '../domain/entities/triage.entity.js';
import { env } from '../config/env.config.js';

export interface AgentExecutionOutput {
  reply: string;
  urgencyLevel: UrgencyLevel;
  toolExecutions: ToolCallExecution[];
  groundingReport: GroundingReport;
  suggestedQuestions: string[];
  telemetry: {
    providerUsed: 'openai' | 'simulation';
    latencyMs: number;
    redFlagsDetected: string[];
    overrodeByRule: boolean;
    groundingVerified: boolean;
  };
}

export class AgentService {
  private tools: IAgentTool[];
  private antiHallucinationGuard: AntiHallucinationGuard;

  constructor(
    private readonly llmProvider: ILlmProvider,
    private readonly doctorRepo: IDoctorRepository,
    private readonly hospitalRepo: IHospitalRepository
  ) {
    this.tools = [
      new SearchDoctorsTool(this.doctorRepo),
      new SearchHospitalsTool(this.hospitalRepo),
      new EvaluateUrgencyTool(),
      new EstimateSecondOpinionTool(),
    ];
    this.antiHallucinationGuard = new AntiHallucinationGuard(this.doctorRepo, this.hospitalRepo);
  }

  public async processPatientInteraction(
    sessionId: string,
    messageHistory: AgentMessageInput[],
    language: 'en' | 'ar'
  ): Promise<AgentExecutionOutput> {
    const lastUserMessage = [...messageHistory].reverse().find(m => m.role === 'user')?.content || '';

    // Step 1: Pre-Triage Red Flags Evaluation (Zero-Hallucination Deterministic Rule Layer)
    const triageCheck = RedFlagsRuleEngine.evaluate(lastUserMessage);

    // Step 2: Generate response via LLM or Simulation Engine
    const generationResult = await this.llmProvider.generateResponse(
      messageHistory,
      this.tools,
      language
    );

    // Step 3: Anti-Hallucination & Entity Grounding Verification
    let finalReply = generationResult.content;
    let groundingReport: GroundingReport = {
      isGrounded: true,
      verifiedEntityIds: [],
      hallucinatedEntitiesDetected: [],
    };

    if (env.ENABLE_ANTI_HALLUCINATION_GUARD) {
      const guardResult = await this.antiHallucinationGuard.validate(
        generationResult.content,
        generationResult.toolExecutions
      );
      finalReply = guardResult.sanitizedText;
      groundingReport = guardResult.groundingReport;
    }

    const urgencyLevel: UrgencyLevel = triageCheck.isEmergency
      ? 'EMERGENCY'
      : triageCheck.urgencyLevel;

    return {
      reply: finalReply,
      urgencyLevel,
      toolExecutions: generationResult.toolExecutions,
      groundingReport,
      suggestedQuestions: generationResult.suggestedQuestions || [
        language === 'ar' ? 'هل يمتد الألم إلى الذراع أو الرقبة؟' : 'Does the pain radiate to arm or neck?',
        language === 'ar' ? 'أرغب برأي ثانٍ من مستشفى شاريتيه ببرلين' : 'I want a second opinion from Charité Berlin',
        language === 'ar' ? 'ما هي تكلفة جراحة القلب في تركيا؟' : 'What is cardiac surgery cost in Turkey?',
      ],
      telemetry: {
        providerUsed: generationResult.providerUsed,
        latencyMs: generationResult.latencyMs,
        redFlagsDetected: triageCheck.detectedRedFlags,
        overrodeByRule: triageCheck.requiresDirectOverride,
        groundingVerified: groundingReport.isGrounded,
      },
    };
  }
}
