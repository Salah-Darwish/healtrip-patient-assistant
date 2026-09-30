export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SECOND_OPINION';

export interface RedFlagCheckResult {
  isEmergency: boolean;
  urgencyLevel: UrgencyLevel;
  urgencyScore: number; // 1 (Routine) to 5 (Critical Life Threat)
  detectedRedFlags: string[];
  safeImmediateAdviceEn: string;
  safeImmediateAdviceAr: string;
  recommendedAction: 'CALL_EMERGENCY' | 'URGENT_IN_PERSON' | 'SPECIALIST_CONSULT' | 'SECOND_OPINION_PACKAGE';
  requiresDirectOverride: boolean;
}

export interface TriageAudit {
  id?: string;
  sessionId: string;
  rawInput: string;
  redFlags: string[];
  urgencyScore: number;
  actionRecommended: string;
  overrodeByRule: boolean;
  createdAt?: Date;
}
