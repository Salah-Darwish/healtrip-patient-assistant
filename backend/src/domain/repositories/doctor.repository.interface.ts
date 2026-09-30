import { DoctorEntity, DoctorFilter } from '../entities/doctor.entity.js';

export interface IDoctorRepository {
  findById(id: string): Promise<DoctorEntity | null>;
  findByName(name: string): Promise<DoctorEntity | null>;
  search(filter: DoctorFilter): Promise<DoctorEntity[]>;
  getAllSpecialties(): Promise<string[]>;
}
