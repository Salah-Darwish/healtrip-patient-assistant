export interface HospitalEntity {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  cityAr: string;
  countryEn: string;
  countryAr: string;
  countryCode: string;
  accreditation: string;
  cardiacCareTier: string;
  hasEmergency24x7: boolean;
  internationalDeskPhone: string;
  emergencyPhone: string;
  website: string;
  descriptionEn: string;
  descriptionAr: string;
  createdAt?: Date;
}

export interface HospitalFilter {
  countryCode?: string;
  city?: string;
  hasEmergencyOnly?: boolean;
  minCardiacTier?: string;
  searchQuery?: string;
}
