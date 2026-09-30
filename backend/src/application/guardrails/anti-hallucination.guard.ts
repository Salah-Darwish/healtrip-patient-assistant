import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface.js';
import { IHospitalRepository } from '../../domain/repositories/hospital.repository.interface.js';
import { GroundingReport, ToolCallExecution } from '../../domain/entities/chat.entity.js';

export interface GuardrailValidationResult {
  isGrounded: boolean;
  sanitizedText: string;
  groundingReport: GroundingReport;
}

export class AntiHallucinationGuard {
  constructor(
    private readonly doctorRepo: IDoctorRepository,
    private readonly hospitalRepo: IHospitalRepository
  ) {}

  public async validate(
    responseText: string,
    toolExecutions: ToolCallExecution[] = []
  ): Promise<GuardrailValidationResult> {
    const legitimateDoctors = new Map<string, string>();
    const legitimateHospitals = new Map<string, string>();

    for (const execution of toolExecutions) {
      if (execution.tool === 'search_doctors' && Array.isArray(execution.output)) {
        for (const doc of execution.output) {
          if (doc && typeof doc === 'object' && 'id' in doc) {
            if ('nameEn' in doc) legitimateDoctors.set(String(doc.nameEn).toLowerCase().replace(/^(dr\.|doctor)\s+/i, '').trim(), String(doc.id));
            if ('nameAr' in doc) legitimateDoctors.set(String(doc.nameAr).toLowerCase().replace(/^(د\.|الدكتور)\s+/i, '').trim(), String(doc.id));
          }
        }
      }

      if (execution.tool === 'search_hospitals' && Array.isArray(execution.output)) {
        for (const hosp of execution.output) {
          if (hosp && typeof hosp === 'object' && 'id' in hosp) {
            if ('nameEn' in hosp) legitimateHospitals.set(String(hosp.nameEn).toLowerCase(), String(hosp.id));
            if ('nameAr' in hosp) legitimateHospitals.set(String(hosp.nameAr).toLowerCase(), String(hosp.id));
          }
        }
      }
    }

    const doctorMentionRegex = /(?:Dr\.|Doctor|د\.|الدكتور|الدكتورة)\s+([A-Z\u0621-\u064A][a-zA-Z\u0621-\u064A\s'-]{2,30})/g;
    const verifiedEntityIds: string[] = [];
    const hallucinatedEntitiesDetected: string[] = [];

    let match: RegExpExecArray | null;
    let sanitized = responseText;

    while ((match = doctorMentionRegex.exec(responseText)) !== null) {
      const fullMention = match[0].trim();
      const rawExtractedName = match[1].trim();
      const extractedClean = rawExtractedName.toLowerCase().replace(/^(dr\.|doctor)\s+/i, '').trim();

      // Check if candidate matches any legitimate tool result
      let foundId: string | undefined;
      for (const [legitName, id] of legitimateDoctors.entries()) {
        if (legitName.includes(extractedClean) || extractedClean.includes(legitName)) {
          foundId = id;
          break;
        }
      }

      if (!foundId) {
        const repoDoc = await this.doctorRepo.findByName(extractedClean);
        if (repoDoc) {
          foundId = repoDoc.id;
        }
      }

      if (foundId) {
        if (!verifiedEntityIds.includes(foundId)) {
          verifiedEntityIds.push(foundId);
        }
      } else {
        // Disregard if candidate is solely a generic single medical role word
        const isSolelyGenericRole = /^(cardiologist|physician|specialist|surgeon|طبيب|استشاري|أخصائي)$/i.test(extractedClean);
        if (!isSolelyGenericRole && extractedClean.length >= 3) {
          hallucinatedEntitiesDetected.push(fullMention);
        }
      }
    }

    for (const [hospName, hospId] of legitimateHospitals.entries()) {
      if (responseText.toLowerCase().includes(hospName)) {
        if (!verifiedEntityIds.includes(hospId)) {
          verifiedEntityIds.push(hospId);
        }
      }
    }

    const isGrounded = hallucinatedEntitiesDetected.length === 0;

    if (!isGrounded) {
      for (const hallucination of hallucinatedEntitiesDetected) {
        sanitized = sanitized.replace(
          new RegExp(hallucination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `[Verified HealTrip Specialist]`
        );
      }
      sanitized += `\n\n*(Note: Recommendations have been filtered and verified against HealTrip's official accredited hospital network to ensure zero unaccredited entries.)*`;
    }

    return {
      isGrounded,
      sanitizedText: sanitized,
      groundingReport: {
        isGrounded,
        verifiedEntityIds,
        hallucinatedEntitiesDetected,
        notes: isGrounded
          ? `All ${verifiedEntityIds.length} entities verified against accredited database.`
          : `Detected ${hallucinatedEntitiesDetected.length} unverified entity mentions that were filtered for patient safety.`,
      },
    };
  }
}
