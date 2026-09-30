import { HospitalEntity, HospitalFilter } from '../entities/hospital.entity.js';

export interface IHospitalRepository {
  findById(id: string): Promise<HospitalEntity | null>;
  findByName(name: string): Promise<HospitalEntity | null>;
  search(filter: HospitalFilter): Promise<HospitalEntity[]>;
  getAllCountries(): Promise<Array<{ code: string; nameEn: string; nameAr: string }>>;
}
