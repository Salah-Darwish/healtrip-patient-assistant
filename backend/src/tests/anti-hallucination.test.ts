import { describe, it, expect } from 'vitest';
import { AntiHallucinationGuard } from '../application/guardrails/anti-hallucination.guard.js';
import { IDoctorRepository } from '../domain/repositories/doctor.repository.interface.js';
import { IHospitalRepository } from '../domain/repositories/hospital.repository.interface.js';

describe('AntiHallucinationGuard (Grounding & Verification Layer)', () => {
  const mockDoctorRepo: IDoctorRepository = {
    findById: async (id: string) => (id === 'doc-marcus-weber' ? { id, nameEn: 'Dr. Marcus Weber' } as any : null),
    findByName: async (name: string) => (name.includes('marcus') ? { id: 'doc-marcus-weber', nameEn: 'Dr. Marcus Weber' } as any : null),
    search: async () => [],
    getAllSpecialties: async () => [],
  };

  const mockHospitalRepo: IHospitalRepository = {
    findById: async () => null,
    findByName: async () => null,
    search: async () => [],
    getAllCountries: async () => [],
  };

  it('should pass verified doctor mentioned in tool execution results', async () => {
    const guard = new AntiHallucinationGuard(mockDoctorRepo, mockHospitalRepo);

    const responseText = 'We recommend consulting Dr. Marcus Weber at Charité Berlin for your second opinion.';
    const toolExecutions = [
      {
        tool: 'search_doctors',
        input: {},
        output: [
          { id: 'doc-marcus-weber', nameEn: 'Dr. Marcus Weber', nameAr: 'د. ماركوس فيبر' },
        ],
        durationMs: 12,
      },
    ];

    const result = await guard.validate(responseText, toolExecutions);

    expect(result.isGrounded).toBe(true);
    expect(result.groundingReport.verifiedEntityIds).toContain('doc-marcus-weber');
    expect(result.groundingReport.hallucinatedEntitiesDetected).toHaveLength(0);
  });

  it('should intercept and sanitize fabricated doctor names not in DB', async () => {
    const guard = new AntiHallucinationGuard(mockDoctorRepo, mockHospitalRepo);

    const responseText = 'You should see Dr. Fictional FakeSurgeon for your chest pain.';
    const toolExecutions = [
      {
        tool: 'search_doctors',
        input: {},
        output: [
          { id: 'doc-marcus-weber', nameEn: 'Dr. Marcus Weber' },
        ],
        durationMs: 10,
      },
    ];

    const result = await guard.validate(responseText, toolExecutions);

    expect(result.isGrounded).toBe(false);
    expect(result.groundingReport.hallucinatedEntitiesDetected.length).toBeGreaterThan(0);
    expect(result.sanitizedText).toContain('[Verified HealTrip Specialist]');
    expect(result.sanitizedText).not.toContain('Dr. Fictional FakeSurgeon');
  });
});
