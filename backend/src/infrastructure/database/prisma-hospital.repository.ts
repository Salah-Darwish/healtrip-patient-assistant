import { prisma } from './prisma.client.js';
import { IHospitalRepository } from '../../domain/repositories/hospital.repository.interface.js';
import { HospitalEntity, HospitalFilter } from '../../domain/entities/hospital.entity.js';

export class PrismaHospitalRepository implements IHospitalRepository {
  public async findById(id: string): Promise<HospitalEntity | null> {
    const hosp = await prisma.hospital.findUnique({
      where: { id },
      include: { doctors: true },
    });
    return hosp as unknown as HospitalEntity | null;
  }

  public async findByName(name: string): Promise<HospitalEntity | null> {
    const normalized = name.toLowerCase().trim();
    const hosp = await prisma.hospital.findFirst({
      where: {
        OR: [
          { nameEn: { contains: normalized } },
          { nameAr: { contains: normalized } },
        ],
      },
      include: { doctors: true },
    });
    return hosp as unknown as HospitalEntity | null;
  }

  public async search(filter: HospitalFilter): Promise<HospitalEntity[]> {
    const whereClause: any = {};

    if (filter.countryCode) {
      whereClause.countryCode = filter.countryCode.toUpperCase();
    }

    if (filter.city) {
      whereClause.OR = [
        { cityEn: { contains: filter.city } },
        { cityAr: { contains: filter.city } },
      ];
    }

    if (filter.hasEmergencyOnly) {
      whereClause.hasEmergency24x7 = true;
    }

    if (filter.searchQuery) {
      const q = filter.searchQuery.trim();
      whereClause.OR = [
        { nameEn: { contains: q } },
        { nameAr: { contains: q } },
        { cityEn: { contains: q } },
        { countryEn: { contains: q } },
      ];
    }

    const hosps = await prisma.hospital.findMany({
      where: whereClause,
      include: { doctors: true },
      take: 10,
    });

    return hosps as unknown as HospitalEntity[];
  }

  public async getAllCountries(): Promise<Array<{ code: string; nameEn: string; nameAr: string }>> {
    const hospitals = await prisma.hospital.findMany({
      select: { countryCode: true, countryEn: true, countryAr: true },
      distinct: ['countryCode'],
    });

    return hospitals.map(h => ({
      code: h.countryCode,
      nameEn: h.countryEn,
      nameAr: h.countryAr,
    }));
  }
}
