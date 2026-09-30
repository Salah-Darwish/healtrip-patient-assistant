import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HealTrip Clinical Directory database...');

  // Clean existing records
  await prisma.chatMessage.deleteMany();
  await prisma.triageAuditLog.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.specialty.deleteMany();

  // 1. Specialties
  const cardiology = await prisma.specialty.create({
    data: {
      code: 'CARDIOLOGY',
      nameEn: 'General & Preventive Cardiology',
      nameAr: 'أمراض القلب العامة والوقائية',
      descriptionEn: 'Evaluation of chest pain, ischemic heart disease, hypertension, and preventive risk scoring.',
      descriptionAr: 'تقييم آلام الصدر، أمراض شرايين القلب الإقفارية، وارتفاع ضغط الدم وفحوصات القلب الوقائية.',
    },
  });

  const interventional = await prisma.specialty.create({
    data: {
      code: 'INTERVENTIONAL_CARDIOLOGY',
      nameEn: 'Interventional Cardiology & Angioplasty',
      nameAr: 'قسطرة القلب والشرايين التداخلية',
      descriptionEn: 'Minimally invasive catheterization, coronary stenting, angioplasty, and structural heart procedures.',
      descriptionAr: 'قسطرة القلب العلاجية، تركيب الدعامات، وتوسيع الشرايين التاجية وعلاج صمامات القلب بالقسطرة.',
    },
  });

  const cardiacSurgery = await prisma.specialty.create({
    data: {
      code: 'CARDIAC_SURGERY',
      nameEn: 'Cardiothoracic Surgery',
      nameAr: 'جراحة القلب والصدر',
      descriptionEn: 'Coronary artery bypass grafting (CABG), valve replacement, and aortic root reconstruction.',
      descriptionAr: 'جراحات القلب المفتوح، ترقيع الشرايين التاجية، واستبدال وترميم صمامات القلب.',
    },
  });

  const electrophysiology = await prisma.specialty.create({
    data: {
      code: 'ELECTROPHYSIOLOGY',
      nameEn: 'Cardiac Electrophysiology & Arrhythmia',
      nameAr: 'كهربائية القلب واضطراب النبض',
      descriptionEn: 'Diagnosis and catheter ablation of cardiac arrhythmias, pacemakers, and defibrillator implants.',
      descriptionAr: 'تشخيص وعلاج اضطرابات نبضات القلب بالقسطرة الحرارية وتركيب منظمات ضربات القلب.',
    },
  });

  // 2. Hospitals
  const hospCleveland = await prisma.hospital.create({
    data: {
      id: 'hosp-cleveland-ad',
      nameEn: 'Cleveland Clinic Abu Dhabi',
      nameAr: 'مستشفى كليفلاند كلينك أبوظبي',
      cityEn: 'Abu Dhabi',
      cityAr: 'أبوظبي',
      countryEn: 'United Arab Emirates',
      countryAr: 'الإمارات العربية المتحدة',
      countryCode: 'UAE',
      accreditation: 'JCI Accredited, Heart Vascular & Thoracic Institute',
      cardiacCareTier: 'Tier 1 Comprehensive Academic Heart Center',
      hasEmergency24x7: true,
      internationalDeskPhone: '+971-2-659-0200',
      emergencyPhone: '998 / 999',
      website: 'https://www.clevelandclinicabudhabi.ae',
      descriptionEn: 'World-renowned extension of US Cleveland Clinic offering elite cardiovascular care, rapid triage, and international patient coordination.',
      descriptionAr: 'امتداد عالمي لكليفلاند كلينك الأمريكية يقدم رعاية متقدمة لأمراض وجراحة القلب وقسم طوارئ مجهز على مدار 24 ساعة.',
    },
  });

  const hospAcibadem = await prisma.hospital.create({
    data: {
      id: 'hosp-acibadem-ist',
      nameEn: 'Acıbadem Maslak Hospital Istanbul',
      nameAr: 'مستشفى أجيبادم مسلك إسطنبول',
      cityEn: 'Istanbul',
      cityAr: 'إسطنبول',
      countryEn: 'Turkey',
      countryAr: 'تركيا',
      countryCode: 'TR',
      accreditation: 'JCI Accredited, ISO 15189 Certified',
      cardiacCareTier: 'Tier 1 Regional Referral & Medical Tourism Hub',
      hasEmergency24x7: true,
      internationalDeskPhone: '+90-212-304-4444',
      emergencyPhone: '112',
      website: 'https://www.acibadem.com.tr',
      descriptionEn: 'Premier medical travel destination for cardiac surgery, complex catheterization, and multi-disciplinary second opinion boards.',
      descriptionAr: 'أبرز وجهات السياحة العلاجية المتخصصة في جراحة القلب والقسطرة الدقيقة مع مكتب استقبال مخصص للمرضى الدوليين.',
    },
  });

  const hospCharite = await prisma.hospital.create({
    data: {
      id: 'hosp-charite-ber',
      nameEn: 'Charité – Universitätsmedizin Berlin',
      nameAr: 'مستشفى شاريتيه الجامعي برلين',
      cityEn: 'Berlin',
      cityAr: 'برلين',
      countryEn: 'Germany',
      countryAr: 'ألمانيا',
      countryCode: 'DE',
      accreditation: 'TÜV Certified, European Center of Excellence for Cardiology',
      cardiacCareTier: 'Tier 1 Continental Academic & Research Center',
      hasEmergency24x7: true,
      internationalDeskPhone: '+49-30-450-50',
      emergencyPhone: '112',
      website: 'https://www.charite.de',
      descriptionEn: 'One of Europe’s largest university hospitals, celebrated for cutting-edge cardiology research, valve repairs, and remote diagnostic second opinions.',
      descriptionAr: 'من أكبر المستشفيات الجامعية في أوروبا، رائد في أبحاث القلب وعمليات ترميم الصمامات والاستشارات الطبية الدقيقة عن بعد.',
    },
  });

  const hospRoyalBrompton = await prisma.hospital.create({
    data: {
      id: 'hosp-brompton-lon',
      nameEn: 'Royal Brompton Hospital London',
      nameAr: 'مستشفى رويال برومبتون لندن',
      cityEn: 'London',
      cityAr: 'لندن',
      countryEn: 'United Kingdom',
      countryAr: 'المملكة المتحدة',
      countryCode: 'GB',
      accreditation: 'CQC Outstanding, Specialist Heart and Lung Center',
      cardiacCareTier: 'Tier 1 Global Tertiary Heart & Lung Institute',
      hasEmergency24x7: true,
      internationalDeskPhone: '+44-20-7352-8121',
      emergencyPhone: '999 / 112',
      website: 'https://www.rbht.nhs.uk',
      descriptionEn: 'World-renowned specialist heart and lung center offering elite adult and pediatric cardiac consultations, advanced MRI/CT, and surgical boards.',
      descriptionAr: 'مركز تخصصي عالمي رائد في أمراض وجراحة القلب والصدر يوفر لجان استشارية دولية لمراجعة الحالات المعقدة.',
    },
  });

  const hospAbdali = await prisma.hospital.create({
    data: {
      id: 'hosp-abdali-amm',
      nameEn: 'Abdali Hospital Amman',
      nameAr: 'مستشفى العبدلي الطبي عمان',
      cityEn: 'Amman',
      cityAr: 'عمان',
      countryEn: 'Jordan',
      countryAr: 'الأردن',
      countryCode: 'JO',
      accreditation: 'JCI Accredited Multi-Specialty Hospital',
      cardiacCareTier: 'Tier 1 Regional Center of Excellence',
      hasEmergency24x7: true,
      internationalDeskPhone: '+962-6-510-9999',
      emergencyPhone: '911',
      website: 'https://www.abdalihospital.com',
      descriptionEn: 'Modern medical center providing state-of-the-art cardiovascular diagnostics, catheterization suites, and concierge international patient care.',
      descriptionAr: 'مستشفى حديث بمعايير عالمية يقدم تشخيصًا دقيقًا لأمراض القلب وقسطرة الشرايين وخدمات راقية للمرضى من دول الخليج والمنطقة.',
    },
  });

  const hospAssalam = await prisma.hospital.create({
    data: {
      id: 'hosp-assalam-cai',
      nameEn: 'As-Salam International Hospital Cairo',
      nameAr: 'مستشفى السلام الدولي القاهرة',
      cityEn: 'Cairo',
      cityAr: 'القاهرة',
      countryEn: 'Egypt',
      countryAr: 'مصر',
      countryCode: 'EG',
      accreditation: 'JCI Accredited Clinical Excellence Hub',
      cardiacCareTier: 'Tier 1 Comprehensive Cardiovascular Care',
      hasEmergency24x7: true,
      internationalDeskPhone: '+20-2-19885',
      emergencyPhone: '123',
      website: 'https://www.assalamhospital.com',
      descriptionEn: 'Premier private medical institution in Cairo with accredited chest pain center and highly qualified interventional cardiologists.',
      descriptionAr: 'أحد أعرق الصروح الطبية في مصر، حاصل على اعتماد JCI ويضم وحدة متكاملة لرعاية آلام الصدر والقسطرة التداخلية العاجلة.',
    },
  });

  // 3. Doctors
  await prisma.doctor.createMany({
    data: [
      {
        id: 'doc-tarek-mansoor',
        hospitalId: hospCleveland.id,
        nameEn: 'Dr. Tarek Al-Mansoor',
        nameAr: 'د. طارق المنصور',
        titleEn: 'Consultant Interventional Cardiologist & Chest Pain Director',
        titleAr: 'استشاري قسطرة القلب والشرايين ورئيس وحدة آلام الصدر',
        specialty: 'Interventional Cardiology',
        subSpecialty: 'Complex Angioplasty & Acute Coronary Care',
        yearsOfExperience: 22,
        languages: 'English, Arabic',
        consultationFeeUsd: 280,
        rating: 4.95,
        reviewsCount: 168,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'American Board certified interventional cardiologist with extensive experience in rapid chest pain evaluation, primary coronary stenting, and high-risk plaque management.',
        bioAr: 'استشاري حاصل على البورد الأمريكي، متخصص في التشخيص العاجل لآلام الصدر، قسطرة الشرايين التاجية الدقيقة، والدعامات الحديثة.',
      },
      {
        id: 'doc-marcus-weber',
        hospitalId: hospCharite.id,
        nameEn: 'Dr. Marcus Weber',
        nameAr: 'د. ماركوس فيبر',
        titleEn: 'Head of Structural Heart & Cardiac Second Opinion Board',
        titleAr: 'رئيس وحدة أمراض القلب الهيكلية ولجنة الرأي الطبي الثاني',
        specialty: 'Cardiology',
        subSpecialty: 'Coronary Ischemia & Valve Disorders',
        yearsOfExperience: 26,
        languages: 'English, German',
        consultationFeeUsd: 350,
        rating: 4.98,
        reviewsCount: 230,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'Pioneering German cardiologist reviewing international second opinions on catheterization vs surgical intervention, coronary calcium scores, and myocardial viability.',
        bioAr: 'خبير ألماني رائد في تقييم الحالات المعقدة وإعطاء رأي طبي ثانٍ حاسم حول الحاجة للقسطرة أو الجراحة وفحوصات حيوية عضلة القلب.',
      },
      {
        id: 'doc-yasemin-arslan',
        hospitalId: hospAcibadem.id,
        nameEn: 'Dr. Yasemin Arslan',
        nameAr: 'د. ياسمين أرسلان',
        titleEn: 'Senior Consultant Cardiologist & Cardiac Imaging Specialist',
        titleAr: 'استشارية أمراض القلب وتشخيص الشرايين بالتصوير المقطعي',
        specialty: 'Cardiology',
        subSpecialty: 'Cardiac CT Angiography & Stress Echocardiography',
        yearsOfExperience: 18,
        languages: 'English, Turkish, Arabic',
        consultationFeeUsd: 210,
        rating: 4.92,
        reviewsCount: 142,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'Expert in non-invasive coronary artery evaluation, CT angiography interpretation, and second opinions for cross-border medical travelers in Istanbul.',
        bioAr: 'متخصصة في الفحص الدقيق لشرايين القلب بدون جراحة، وتفسير الأشعة المقطعية للشرايين التاجية ومرافقة المرضى الدوليين.',
      },
      {
        id: 'doc-sarah-jenkins',
        hospitalId: hospRoyalBrompton.id,
        nameEn: 'Dr. Sarah Jenkins',
        nameAr: 'د. سارة جنكينز',
        titleEn: 'Professor of Clinical Cardiology & Coronary Risk Board',
        titleAr: 'أستاذة طب القلب السريري ورئيسة مجلس تقييم مخاطر الشرايين',
        specialty: 'Cardiology',
        subSpecialty: 'Microvascular Angina & Preventive Cardiology',
        yearsOfExperience: 24,
        languages: 'English, French',
        consultationFeeUsd: 420,
        rating: 4.97,
        reviewsCount: 195,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'Distinguished London heart specialist focusing on atypical chest pain, coronary microvascular dysfunction, and comprehensive medical optimization.',
        bioAr: 'استشارية بارزة في لندن متخصصة في تشخيص آلام الصدر غير النمطية، والوقاية المتقدمة من الأزمات القلبية والاستشارات الدولية.',
      },
      {
        id: 'doc-zaid-kayali',
        hospitalId: hospAbdali.id,
        nameEn: 'Dr. Zaid Al-Kayali',
        nameAr: 'د. زيد الكيالي',
        titleEn: 'Consultant Interventional Cardiologist',
        titleAr: 'استشاري أمراض وقسطرة القلب والشرايين',
        specialty: 'Interventional Cardiology',
        subSpecialty: 'Coronary Stenting & Radial Artery Angiography',
        yearsOfExperience: 19,
        languages: 'English, Arabic',
        consultationFeeUsd: 190,
        rating: 4.91,
        reviewsCount: 110,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'British-trained interventional cardiologist in Amman specializing in transradial coronary angiography, emergency stent placement, and second opinion case reviews.',
        bioAr: 'استشاري تدرب في المملكة المتحدة متخصص في قسطرة الشرايين عبر شريان الرسغ وتركيب الدعامات الدوائية الحديثة وتقييم الحالات الإقليمية.',
      },
      {
        id: 'doc-hisham-qandil',
        hospitalId: hospAssalam.id,
        nameEn: 'Dr. Hisham Qandil',
        nameAr: 'د. هشام قنديل',
        titleEn: 'Professor of Cardiology & Cath Lab Director',
        titleAr: 'أستاذ أمراض القلب ورئيس وحدة القسطرة التداخلية',
        specialty: 'Interventional Cardiology',
        subSpecialty: 'Complex CTO Angioplasty & Emergency STEMI Care',
        yearsOfExperience: 27,
        languages: 'English, Arabic',
        consultationFeeUsd: 160,
        rating: 4.89,
        reviewsCount: 180,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'Pioneer of primary coronary interventions in Cairo, specializing in complex coronary lesions and guiding patients on conservative vs procedural pathways.',
        bioAr: 'رائد القسطرة القلبية التداخلية في مصر، خبير في علاج انسداد الشرايين المزمن وتوجيه المرضى بين العلاج الدوائي أو التدخل التداخلي.',
      },
      {
        id: 'doc-emre-kurt',
        hospitalId: hospAcibadem.id,
        nameEn: 'Dr. Emre Kurt',
        nameAr: 'د. إمري كورت',
        titleEn: 'Senior Cardiovascular Surgeon',
        titleAr: 'كبير جراحي القلب والأوعية الدموية',
        specialty: 'Cardiac Surgery',
        subSpecialty: 'Minimally Invasive CABG & Off-Pump Surgery',
        yearsOfExperience: 21,
        languages: 'English, Turkish',
        consultationFeeUsd: 260,
        rating: 4.96,
        reviewsCount: 154,
        acceptsSecondOpinion: true,
        isAvailableOnline: true,
        bioEn: 'Leader in beating-heart coronary bypass and minimally invasive cardiac surgical second opinions for medical tourists seeking options beyond open surgery.',
        bioAr: 'جراح قلب متخصص في عمليات مجازة الشريان التاجي بالمنظار والقلب النابض، يقدم استشارات مفصلة للمرضى الباحثين عن بدائل جراحية طفيفة التوغل.',
      },
    ],
  });

  console.log('✅ Seed completed successfully with 6 hospitals and 7 elite cardiac specialists.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
