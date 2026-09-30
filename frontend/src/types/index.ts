export type Language = 'en' | 'ar';
export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'SECOND_OPINION';

export interface Doctor {
  id: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  specialty: string;
  subSpecialty?: string;
  yearsOfExperience: number;
  languages: string;
  consultationFeeUsd: number;
  rating: number;
  reviewsCount: number;
  acceptsSecondOpinion: boolean;
  isAvailableOnline: boolean;
  bioEn: string;
  bioAr: string;
  hospital?: Hospital;
}

export interface Hospital {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  countryEn: string;
  countryAr: string;
  countryCode: string;
  accreditation: string;
  cardiacCareTier: string;
  hasEmergency24x7: boolean;
  internationalDeskPhone: string;
  emergencyPhone: string;
  website: string;
  descriptionEn?: string;
  descriptionAr?: string;
}

export interface ToolExecution {
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

export interface TelemetryData {
  providerUsed: 'openai' | 'simulation';
  latencyMs: number;
  redFlagsDetected: string[];
  overrodeByRule: boolean;
  groundingVerified: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  urgencyLevel?: UrgencyLevel;
  suggestedQuestions?: string[];
  recommendedDoctors?: Doctor[];
  recommendedHospitals?: Hospital[];
  toolExecutions?: ToolExecution[];
  groundingReport?: GroundingReport;
  telemetry?: TelemetryData;
}
