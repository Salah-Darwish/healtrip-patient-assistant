import { IAgentTool, ToolDefinition } from './base.tool.js';

interface SecondOpinionPackage {
  country: string;
  countryCode: string;
  estimatedFeeUsd: { min: number; max: number };
  typicalTurnaroundDays: number;
  requiredDocuments: string[];
  recommendedBoard: string;
}

const PACKAGES: Record<string, SecondOpinionPackage> = {
  DE: {
    country: 'Germany',
    countryCode: 'DE',
    estimatedFeeUsd: { min: 350, max: 600 },
    typicalTurnaroundDays: 3,
    requiredDocuments: [
      'Coronary Angiogram DICOM CD / Video files',
      'Recent Transthoracic Echocardiogram (Echo) Report',
      'Resting and Stress 12-Lead ECG',
      'Cardiac Enzyme & Troponin / Lipid Blood Panels',
    ],
    recommendedBoard: 'Charité Berlin Multi-Disciplinary Cardiovascular Board',
  },
  TR: {
    country: 'Turkey',
    countryCode: 'TR',
    estimatedFeeUsd: { min: 200, max: 350 },
    typicalTurnaroundDays: 2,
    requiredDocuments: [
      'Coronary Angiography or Cardiac CT scan',
      'Echocardiography Report',
      'Clinical Summary & Prior Medical History in English or Arabic',
    ],
    recommendedBoard: 'Acıbadem Istanbul International Patient Council',
  },
  UAE: {
    country: 'United Arab Emirates',
    countryCode: 'UAE',
    estimatedFeeUsd: { min: 280, max: 450 },
    typicalTurnaroundDays: 1,
    requiredDocuments: [
      'Full Medical Records & Hospital Discharge Summary',
      'Recent ECG and Cardiac Ultrasound',
      'Current Medication List and Cardiac Risk Factors',
    ],
    recommendedBoard: 'Cleveland Clinic Abu Dhabi Cardiovascular Review Group',
  },
  JO: {
    country: 'Jordan',
    countryCode: 'JO',
    estimatedFeeUsd: { min: 180, max: 280 },
    typicalTurnaroundDays: 2,
    requiredDocuments: [
      'Cardiac Catheterization Report & Images',
      'Echo Doppler Summary',
      'Blood Chemistry & Cardiac Risk Profile',
    ],
    recommendedBoard: 'Abdali Hospital Amman Regional Heart Panel',
  },
  GB: {
    country: 'United Kingdom',
    countryCode: 'GB',
    estimatedFeeUsd: { min: 400, max: 700 },
    typicalTurnaroundDays: 4,
    requiredDocuments: [
      'Complete Cardiology Diagnostic Portfolio (DICOM)',
      'Cardiologist Clinical Referral Letter',
      'Current Medications and Vital Signs Log',
    ],
    recommendedBoard: 'Royal Brompton London Specialist Heart Panel',
  },
};

export class EstimateSecondOpinionTool implements IAgentTool {
  public readonly definition: ToolDefinition = {
    type: 'function',
    function: {
      name: 'estimate_second_opinion',
      description:
        'Provides HealTrip cross-border second opinion package details, including turnaround time, estimated specialist review fee in USD, required diagnostic files (DICOM angiograms, Echo, ECG), and recommended medical hubs.',
      parameters: {
        type: 'object',
        properties: {
          destinationCountryCode: {
            type: 'string',
            description: 'Target medical hub: "DE" (Germany), "TR" (Turkey), "UAE", "JO" (Jordan), "GB" (UK)',
          },
          procedureOrCondition: {
            type: 'string',
            description: 'The diagnosis under review, e.g. "Stent vs Bypass (CABG)", "Aortic Valve", "Chest Pain Unclear Cause"',
          },
        },
      },
    },
  };

  public async execute(args: { destinationCountryCode?: string; procedureOrCondition?: string }): Promise<any> {
    const code = (args.destinationCountryCode || 'TR').toUpperCase();
    const pkg = PACKAGES[code] || PACKAGES['TR'];

    return {
      selectedDestination: pkg.country,
      destinationCode: pkg.countryCode,
      conditionUnderReview: args.procedureOrCondition || 'Coronary Artery & Chest Pain Evaluation',
      estimatedReviewFeeUsd: `$${pkg.estimatedFeeUsd.min} - $${pkg.estimatedFeeUsd.max}`,
      typicalTurnaroundDays: `${pkg.typicalTurnaroundDays} business days`,
      requiredClinicalDocuments: pkg.requiredDocuments,
      recommendedBoard: pkg.recommendedBoard,
      healTripSupport: 'HealTrip coordinates medical record translation, secure DICOM transmission, and direct video consultation.',
    };
  }
}
