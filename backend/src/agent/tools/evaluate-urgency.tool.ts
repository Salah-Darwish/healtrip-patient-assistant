import { IAgentTool, ToolDefinition } from './base.tool.js';
import { RedFlagsRuleEngine } from '../../application/guardrails/red-flags.rule-engine.js';
import { UrgencyLevel } from '../../domain/entities/triage.entity.js';

export class EvaluateUrgencyTool implements IAgentTool {
  public readonly definition: ToolDefinition = {
    type: 'function',
    function: {
      name: 'evaluate_urgency',
      description:
        'Clinically evaluate the patient symptoms, chest pain characteristics, and red flags to determine the appropriate next step (Emergency Department vs Urgent Cardiology Clinic vs Second Opinion vs Teleconsult).',
      parameters: {
        type: 'object',
        properties: {
          symptomDescription: {
            type: 'string',
            description: 'Patient full symptom text and onset description',
          },
          hasRadiationToArmOrJaw: {
            type: 'boolean',
            description: 'Whether pain radiates to left arm, neck, or jaw',
          },
          hasShortnessOfBreath: {
            type: 'boolean',
            description: 'Whether patient is short of breath or experiencing cold sweat',
          },
          isSeekingSecondOpinion: {
            type: 'boolean',
            description: 'Whether patient is clinically stable and evaluating upcoming surgery or treatment abroad',
          },
        },
        required: ['symptomDescription'],
      },
    },
  };

  public async execute(args: {
    symptomDescription: string;
    hasRadiationToArmOrJaw?: boolean;
    hasShortnessOfBreath?: boolean;
    isSeekingSecondOpinion?: boolean;
  }): Promise<any> {
    let combinedText = args.symptomDescription;
    if (args.hasRadiationToArmOrJaw) combinedText += ' radiating to left arm and jaw';
    if (args.hasShortnessOfBreath) combinedText += ' shortness of breath and sweating';
    if (args.isSeekingSecondOpinion) combinedText += ' seeking second opinion';

    const triage = RedFlagsRuleEngine.evaluate(combinedText);

    return {
      urgencyLevel: triage.urgencyLevel,
      urgencyScore: triage.urgencyScore,
      isEmergency: triage.isEmergency,
      detectedRedFlags: triage.detectedRedFlags,
      recommendedNextStep: triage.recommendedAction,
      clinicalGuidanceEn: triage.safeImmediateAdviceEn,
      clinicalGuidanceAr: triage.safeImmediateAdviceAr,
    };
  }
}
