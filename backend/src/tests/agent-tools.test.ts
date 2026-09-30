import { describe, it, expect } from 'vitest';
import { EstimateSecondOpinionTool } from '../agent/tools/estimate-second-opinion.tool.js';
import { EvaluateUrgencyTool } from '../agent/tools/evaluate-urgency.tool.js';

describe('Clinical Agent Tools', () => {
  it('EstimateSecondOpinionTool should return accurate package details for Germany and Turkey', async () => {
    const tool = new EstimateSecondOpinionTool();

    const dePackage = await tool.execute({ destinationCountryCode: 'DE' });
    expect(dePackage.selectedDestination).toBe('Germany');
    expect(dePackage.destinationCode).toBe('DE');
    expect(dePackage.requiredClinicalDocuments).toEqual(
      expect.arrayContaining([expect.stringContaining('Coronary Angiogram')])
    );

    const trPackage = await tool.execute({ destinationCountryCode: 'TR' });
    expect(trPackage.selectedDestination).toBe('Turkey');
    expect(trPackage.destinationCode).toBe('TR');
  });

  it('EvaluateUrgencyTool should flag emergency when radiation to arm is provided', async () => {
    const tool = new EvaluateUrgencyTool();
    const result = await tool.execute({
      symptomDescription: 'Crushing chest pressure',
      hasRadiationToArmOrJaw: true,
      hasShortnessOfBreath: true,
    });

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe('EMERGENCY');
    expect(result.recommendedNextStep).toBe('CALL_EMERGENCY');
  });
});
