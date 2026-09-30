import { describe, it, expect } from 'vitest';
import { RedFlagsRuleEngine } from '../application/guardrails/red-flags.rule-engine.js';

describe('RedFlagsRuleEngine (Deterministic Medical Safety Layer)', () => {
  it('should detect acute emergency when chest pain radiates to left arm', () => {
    const input = 'I have severe chest pain and it is radiating to my left arm and jaw.';
    const result = RedFlagsRuleEngine.evaluate(input);

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe('EMERGENCY');
    expect(result.recommendedAction).toBe('CALL_EMERGENCY');
    expect(result.detectedRedFlags).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Severe / Crushing Chest Pain'),
        expect.stringContaining('Radiation to Left Arm'),
      ])
    );
  });

  it('should detect emergency in Arabic clinical phrases with diaphoresis', () => {
    const input = 'أعاني من ثقل شديد في الصدر مع عرق بارد وضيق في التنفس';
    const result = RedFlagsRuleEngine.evaluate(input);

    expect(result.isEmergency).toBe(true);
    expect(result.urgencyLevel).toBe('EMERGENCY');
    expect(result.safeImmediateAdviceAr).toContain('تنبيه طبي طارئ');
  });

  it('should identify non-acute Second Opinion intent', () => {
    const input = 'I had an angiogram showing 70% blockage. I want a second opinion on stent vs bypass in Germany.';
    const result = RedFlagsRuleEngine.evaluate(input);

    expect(result.isEmergency).toBe(false);
    expect(result.urgencyLevel).toBe('SECOND_OPINION');
    expect(result.recommendedAction).toBe('SECOND_OPINION_PACKAGE');
  });

  it('should triage ambiguous mild chest discomfort to urgent in-person consult', () => {
    const input = 'I have chest pain that started yesterday, no other symptoms.';
    const result = RedFlagsRuleEngine.evaluate(input);

    expect(result.isEmergency).toBe(false);
    expect(result.urgencyLevel).toBe('URGENT');
    expect(result.recommendedAction).toBe('SPECIALIST_CONSULT');
  });
});
