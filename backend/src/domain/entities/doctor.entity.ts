import { HospitalEntity } from './hospital.entity.js';

export interface DoctorEntity {
  id: string;
  hospitalId: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  specialty: string;
  subSpecialty?: string | null;
  yearsOfExperience: number;
  languages: string;
  consultationFeeUsd: number;
  rating: number;
  reviewsCount: number;
  acceptsSecondOpinion: boolean;
  isAvailableOnline: boolean;
  bioEn: string;
  bioAr: string;
  hospital?: HospitalEntity;
  createdAt?: Date;
}

export interface DoctorFilter {
  specialty?: string;
  subSpecialty?: string;
  countryCode?: string;
  acceptsSecondOpinion?: boolean;
  isAvailableOnline?: boolean;
  language?: string;
  searchQuery?: string;
  maxFeeUsd?: number;
}
