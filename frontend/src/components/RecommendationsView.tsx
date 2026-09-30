import React from 'react';
import { UserCheck, Building2, Star, Shield, Phone, ExternalLink } from 'lucide-react';
import { Doctor, Hospital, Language } from '../types/index.js';
import { translations } from '../i18n/translations.js';

interface RecommendationsViewProps {
  doctors?: Doctor[];
  hospitals?: Hospital[];
  language: Language;
  onRequestDoctorConsult: (doctor: Doctor) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  doctors,
  hospitals,
  language,
  onRequestDoctorConsult,
}) => {
  const t = translations[language];
  const hasDoctors = doctors && doctors.length > 0;
  const hasHospitals = hospitals && hospitals.length > 0;

  if (!hasDoctors && !hasHospitals) return null;

  return (
    <div className="recommendations-container">
      {hasDoctors && (
        <div>
          <div className="recommendations-section-title">
            <UserCheck size={16} />
            <span>{t.doctorsHeader}</span>
          </div>

          <div className="cards-grid" style={{ marginTop: '0.6rem' }}>
            {doctors.map(doc => {
              const name = language === 'ar' ? doc.nameAr : doc.nameEn;
              const title = language === 'ar' ? doc.titleAr : doc.titleEn;
              const hospName = language === 'ar' ? doc.hospital?.nameAr : doc.hospital?.nameEn;
              const country = language === 'ar' ? doc.hospital?.countryAr : doc.hospital?.countryEn;
              const bio = language === 'ar' ? doc.bioAr : doc.bioEn;

              return (
                <div key={doc.id} className="doctor-card">
                  <div className="doc-header">
                    <div className="doc-avatar">
                      <UserCheck size={22} />
                    </div>
                    <div className="doc-meta">
                      <div className="doc-name">{name}</div>
                      <div className="doc-title">{title}</div>
                      <div className="doc-hospital">
                        <Building2 size={12} />
                        <span>{hospName} ({country})</span>
                      </div>
                    </div>
                  </div>

                  <div className="doc-badges">
                    <span className="pill-badge badge-exp">
                      {doc.yearsOfExperience} {t.experience}
                    </span>
                    <span className="pill-badge badge-rating">
                      <Star size={11} style={{ display: 'inline', marginInlineEnd: '2px' }} />
                      {doc.rating} ({doc.reviewsCount})
                    </span>
                    <span className="pill-badge badge-fee">
                      {t.secondOpinionFee} ${doc.consultationFeeUsd}
                    </span>
                  </div>

                  <p className="doc-bio">{bio}</p>

                  <button
                    className="doc-action-btn"
                    onClick={() => onRequestDoctorConsult(doc)}
                  >
                    <span>{t.bookConsultation}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasHospitals && (
        <div style={{ marginTop: '1rem' }}>
          <div className="recommendations-section-title">
            <Building2 size={16} />
            <span>{t.hospitalsHeader}</span>
          </div>

          <div className="cards-grid" style={{ marginTop: '0.6rem' }}>
            {hospitals.map(hosp => {
              const name = language === 'ar' ? hosp.nameAr : hosp.nameEn;
              const city = language === 'ar' ? hosp.cityAr : hosp.cityEn;
              const country = language === 'ar' ? hosp.countryAr : hosp.countryEn;

              return (
                <div key={hosp.id} className="hospital-card">
                  <div className="hosp-title-row">
                    <div>
                      <div className="hosp-name">{name}</div>
                      <div className="hosp-location">{city}, {country}</div>
                    </div>
                    <span className="hosp-accreditation">
                      <Shield size={11} style={{ display: 'inline', marginInlineEnd: '2px' }} />
                      {hosp.accreditation.split(',')[0]}
                    </span>
                  </div>

                  <div className="hosp-emergency-row">
                    <div className="emergency-chip">
                      <Phone size={13} />
                      <span>{hosp.emergencyPhone}</span>
                    </div>

                    <a
                      href={hosp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      <ExternalLink size={11} />
                      <span>Website</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
