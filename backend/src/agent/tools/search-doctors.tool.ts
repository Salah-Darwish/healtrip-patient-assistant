import { IAgentTool, ToolDefinition } from './base.tool.js';
import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface.js';
import { DoctorFilter } from '../../domain/entities/doctor.entity.js';

export class SearchDoctorsTool implements IAgentTool {
  constructor(private readonly doctorRepo: IDoctorRepository) {}

  public readonly definition: ToolDefinition = {
    type: 'function',
    function: {
      name: 'search_doctors',
      description:
        'Search verified cardiologists and cardiac surgeons in the HealTrip database by specialty, country, languages, or second opinion availability. Prohibited from inventing doctors outside this database.',
      parameters: {
        type: 'object',
        properties: {
          specialty: {
            type: 'string',
            description: 'Medical specialty, e.g. "Cardiology", "Interventional Cardiology", "Cardiac Surgery"',
          },
          countryCode: {
            type: 'string',
            description: 'ISO country code, e.g. "UAE", "TR" (Turkey), "DE" (Germany), "GB" (UK), "JO" (Jordan), "EG" (Egypt)',
          },
          acceptsSecondOpinion: {
            type: 'boolean',
            description: 'Whether doctor offers remote or cross-border second opinion review',
          },
          isAvailableOnline: {
            type: 'boolean',
            description: 'Whether doctor is available for teleconsultation',
          },
          searchQuery: {
            type: 'string',
            description: 'Free-text search keyword for symptom, procedure, or doctor name',
          },
        },
      },
    },
  };

  public async execute(args: DoctorFilter): Promise<any> {
    const doctors = await this.doctorRepo.search(args);

    return doctors.map(doc => ({
      id: doc.id,
      nameEn: doc.nameEn,
      nameAr: doc.nameAr,
      titleEn: doc.titleEn,
      titleAr: doc.titleAr,
      specialty: doc.specialty,
      subSpecialty: doc.subSpecialty,
      yearsOfExperience: doc.yearsOfExperience,
      languages: doc.languages,
      consultationFeeUsd: doc.consultationFeeUsd,
      rating: doc.rating,
      hospitalNameEn: doc.hospital?.nameEn,
      hospitalNameAr: doc.hospital?.nameAr,
      hospitalCountry: doc.hospital?.countryEn,
      acceptsSecondOpinion: doc.acceptsSecondOpinion,
      isAvailableOnline: doc.isAvailableOnline,
    }));
  }
}
