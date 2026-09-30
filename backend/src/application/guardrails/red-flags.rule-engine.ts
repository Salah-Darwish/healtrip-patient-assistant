import { RedFlagCheckResult, UrgencyLevel } from '../../domain/entities/triage.entity.js';

interface RedFlagPattern {
  name: string;
  weight: number;
  regex: RegExp;
  category: 'CHEST_PRESSURE' | 'RADIATION' | 'AUTONOMIC' | 'DURATION' | 'CARDIAC_HISTORY';
}

const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  // Crushing or severe pressure chest pain
  {
    name: 'Severe / Crushing Chest Pain',
    weight: 4,
    regex: /(crushing|squeezing|heavy pressure|elephant on chest|severe chest pain|tightness in chest|عصر|ثقل شديد|ألم حاد في الصدر|ضغط شديد|ألم شديد بالصدر)/i,
    category: 'CHEST_PRESSURE',
  },
  // Radiation to arm, jaw, neck, back
  {
    name: 'Radiation to Left Arm / Jaw / Neck / Back',
    weight: 4,
    regex: /(radiat(ing|es|ion)?\s*(to|into|towards)?\s*(the|my|his|her)?\s*(left arm|arm|jaw|neck|back|shoulder)|يمتد (إلى|لـ)? (الذراع|اليد اليسرى|الفك|الرقبة|الكتف|الظهر))/i,
    category: 'RADIATION',
  },
  // Shortness of breath / dyspnea
  {
    name: 'Acute Shortness of Breath / Dyspnea',
    weight: 3,
    regex: /(shortness of breath|difficulty breathing|breathless|gasping|can'?t breathe|ضيق (في )?التنفس|صعوبة (في )?التنفس|نهجان)/i,
    category: 'AUTONOMIC',
  },
  // Diaphoresis / cold sweats
  {
    name: 'Diaphoresis / Cold Sweating',
    weight: 3,
    regex: /(cold sweat|sweating profusely|diaphoresis|drenched in sweat|عرق بارد|تعرق شديد)/i,
    category: 'AUTONOMIC',
  },
  // Syncope / fainting / severe dizziness
  {
    name: 'Syncope / Loss of Consciousness / Severe Dizziness',
    weight: 3,
    regex: /(passed out|fainted|loss of consciousness|blacked out|severe dizziness|spinning|إغماء|فقدان الوعي|دوخة شديدة)/i,
    category: 'AUTONOMIC',
  },
  // Sudden onset acute pain
  {
    name: 'Sudden Onset / Lasting > 15-20 Minutes',
    weight: 2,
    regex: /(sudden onset|started suddenly|lasting (more than|over)? 20 min|won'?t go away|ألم مفاجئ|مستمر منذ أكثر من عشرين دقيقة)/i,
    category: 'DURATION',
  },
];

const SECOND_OPINION_PATTERNS = [
  /(second opinion|seek a second opinion|another doctor'?s view|travel abroad|surgery in germany|treatment in turkey|رأي طبي ثان|استشارة ثانية|السفر للعلاج|عملية في تركيا|ألمانيا)/i,
  /(scheduled for (surgery|bypass|stent|angioplasty|valve)|مجدول لعملية|قسطرة|دعامات|قلب مفتوح)/i,
];

export class RedFlagsRuleEngine {
  public static evaluate(text: string, currentUrgency: UrgencyLevel = 'ROUTINE'): RedFlagCheckResult {
    const detectedFlags: string[] = [];
    let totalScore = 0;

    for (const pattern of RED_FLAG_PATTERNS) {
      if (pattern.regex.test(text)) {
        detectedFlags.push(pattern.name);
        totalScore += pattern.weight;
      }
    }

    const hasRadiation = detectedFlags.some(f => f.includes('Radiation'));
    const hasPressure = detectedFlags.some(f => f.includes('Pressure') || f.includes('Crushing'));
    const hasAutonomic = detectedFlags.some(f => f.includes('Shortness of Breath') || f.includes('Sweating') || f.includes('Syncope'));

    const isEmergency = totalScore >= 4 || (hasRadiation && hasPressure) || (hasPressure && hasAutonomic);

    if (isEmergency) {
      return {
        isEmergency: true,
        urgencyLevel: 'EMERGENCY',
        urgencyScore: Math.min(5, Math.max(4, totalScore)),
        detectedRedFlags: detectedFlags,
        safeImmediateAdviceEn:
          'CRITICAL MEDICAL ALERT: Your symptoms (chest discomfort with red flags) require immediate emergency evaluation. Stop all physical exertion. Do NOT drive yourself. Dial local emergency services (e.g. 911, 999, 112) or go to the nearest emergency room immediately.',
        safeImmediateAdviceAr:
          'تنبيه طبي طارئ: الأعراض التي ذكرتها (ألم الصدر مع مؤشرات خطر) تستوجب التدخل الطبي الفوري في قسم الطوارئ. توقف عن أي مجهود بدني ولا تقد سيارتك بنفسك. اتصل بالإسعاف فورًا (998 / 911 / 112) أو توجه لأقرب مستشفى طوارئ دون تأخير.',
        recommendedAction: 'CALL_EMERGENCY',
        requiresDirectOverride: true,
      };
    }

    const isSecondOpinionIntent = SECOND_OPINION_PATTERNS.some(p => p.test(text));

    if (isSecondOpinionIntent || currentUrgency === 'SECOND_OPINION') {
      return {
        isEmergency: false,
        urgencyLevel: 'SECOND_OPINION',
        urgencyScore: 2,
        detectedRedFlags: detectedFlags,
        safeImmediateAdviceEn:
          'Your condition appears non-acute and suitable for a structured Second Opinion or international specialist review.',
        safeImmediateAdviceAr:
          'حالتك مستقرة حاليًا ومناسبة للحصول على رأي طبي ثانٍ أو استشارة تخصصية دولية عبر مراكز HealTrip المعتمدة.',
        recommendedAction: 'SECOND_OPINION_PACKAGE',
        requiresDirectOverride: false,
      };
    }

    if (totalScore >= 2 || /chest pain|ألم في الصدر/i.test(text)) {
      return {
        isEmergency: false,
        urgencyLevel: 'URGENT',
        urgencyScore: 3,
        detectedRedFlags: detectedFlags,
        safeImmediateAdviceEn:
          'Any unresolved chest discomfort warrants formal in-person medical evaluation by a cardiologist today to rule out acute ischemia.',
        safeImmediateAdviceAr:
          'أي انزعاج في منطقة الصدر يحتاج إلى فحص سريري مباشر وتخطيط قلب لدى استشاري قلب في أسرع وقت لاستبعاد أي نقص تروية.',
        recommendedAction: 'SPECIALIST_CONSULT',
        requiresDirectOverride: false,
      };
    }

    return {
      isEmergency: false,
      urgencyLevel: 'ROUTINE',
      urgencyScore: 1,
      detectedRedFlags: [],
      safeImmediateAdviceEn: 'Routine consultation recommended.',
      safeImmediateAdviceAr: 'استشارة اعتيادية مجدولة.',
      recommendedAction: 'SPECIALIST_CONSULT',
      requiresDirectOverride: false,
    };
  }
}
