import { IAgentTool, ToolDefinition } from './base.tool.js';
import { IHospitalRepository } from '../../domain/repositories/hospital.repository.interface.js';
import { HospitalFilter } from '../../domain/entities/hospital.entity.js';

export class SearchHospitalsTool implements IAgentTool {
  constructor(private readonly hospitalRepo: IHospitalRepository) {}

  public readonly definition: ToolDefinition = {
    type: 'function',
    function: {
      name: 'search_hospitals',
      description:
        'Search accredited medical centers and hospitals in the HealTrip network. Filters by country, 24/7 emergency readiness, and cardiac tier.',
      parameters: {
        type: 'object',
        properties: {
          countryCode: {
            type: 'string',
            description: 'Country code, e.g. "UAE", "TR", "DE", "GB", "JO", "EG"',
          },
          city: {
            type: 'string',
            description: 'City name, e.g. "Abu Dhabi", "Istanbul", "Berlin", "London", "Amman", "Cairo"',
          },
          hasEmergencyOnly: {
            type: 'boolean',
            description: 'Set to true if patient needs 24/7 emergency room and acute catheterization lab',
          },
          searchQuery: {
            type: 'string',
            description: 'Keyword search for hospital name or accreditation',
          },
        },
      },
    },
  };

  public async execute(args: HospitalFilter): Promise<any> {
    const hospitals = await this.hospitalRepo.search(args);

    return hospitals.map(h => ({
      id: h.id,
      nameEn: h.nameEn,
      nameAr: h.nameAr,
      cityEn: h.cityEn,
      cityAr: h.cityAr,
      countryEn: h.countryEn,
      countryAr: h.countryAr,
      countryCode: h.countryCode,
      accreditation: h.accreditation,
      cardiacCareTier: h.cardiacCareTier,
      hasEmergency24x7: h.hasEmergency24x7,
      internationalDeskPhone: h.internationalDeskPhone,
      emergencyPhone: h.emergencyPhone,
      website: h.website,
    }));
  }
}
