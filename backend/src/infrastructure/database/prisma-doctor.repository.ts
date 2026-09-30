import { prisma } from './prisma.client.js';
import { IDoctorRepository } from '../../domain/repositories/doctor.repository.interface.js';
import { DoctorEntity, DoctorFilter } from '../../domain/entities/doctor.entity.js';

export class PrismaDoctorRepository implements IDoctorRepository {
  public async findById(id: string): Promise<DoctorEntity | null> {
    const doc = await prisma.doctor.findUnique({
      where: { id },
      include: { hospital: true },
    });
    return doc as unknown as DoctorEntity | null;
  }

  public async findByName(name: string): Promise<DoctorEntity | null> {
    const normalized = name.toLowerCase().trim();
    const doc = await prisma.doctor.findFirst({
      where: {
        OR: [
          { nameEn: { contains: normalized } },
          { nameAr: { contains: normalized } },
        ],
      },
      include: { hospital: true },
    });
    return doc as unknown as DoctorEntity | null;
  }

  public async search(filter: DoctorFilter): Promise<DoctorEntity[]> {
    const whereClause: any = {};

    if (filter.specialty) {
      whereClause.OR = [
        { specialty: { contains: filter.specialty } },
        { subSpecialty: { contains: filter.specialty } },
      ];
    }

    if (filter.acceptsSecondOpinion !== undefined) {
      whereClause.acceptsSecondOpinion = filter.acceptsSecondOpinion;
    }

    if (filter.isAvailableOnline !== undefined) {
      whereClause.isAvailableOnline = filter.isAvailableOnline;
    }

    if (filter.language) {
      whereClause.languages = { contains: filter.language };
    }

    if (filter.countryCode) {
      whereClause.hospital = {
        countryCode: filter.countryCode.toUpperCase(),
      };
    }

    if (filter.maxFeeUsd) {
      whereClause.consultationFeeUsd = { lte: filter.maxFeeUsd };
    }

    if (filter.searchQuery) {
      const q = filter.searchQuery.trim();
      whereClause.OR = [
        { nameEn: { contains: q } },
        { nameAr: { contains: q } },
        { specialty: { contains: q } },
        { bioEn: { contains: q } },
      ];
    }

    const docs = await prisma.doctor.findMany({
      where: whereClause,
      include: { hospital: true },
      orderBy: [{ rating: 'desc' }, { yearsOfExperience: 'desc' }],
      take: 10,
    });

    return docs as unknown as DoctorEntity[];
  }

  public async getAllSpecialties(): Promise<string[]> {
    const specialties = await prisma.specialty.findMany({
      select: { nameEn: true },
    });
    return specialties.map(s => s.nameEn);
  }
}
