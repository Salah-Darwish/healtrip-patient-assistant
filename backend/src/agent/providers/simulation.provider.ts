import { ILlmProvider, AgentMessageInput, AgentGenerationResult } from './llm-provider.interface.js';
import { IAgentTool } from '../tools/base.tool.js';
import { ToolCallExecution } from '../../domain/entities/chat.entity.js';
import { RedFlagsRuleEngine } from '../../application/guardrails/red-flags.rule-engine.js';

export class SimulationProvider implements ILlmProvider {
  public async generateResponse(
    messages: AgentMessageInput[],
    tools: IAgentTool[],
    language: 'en' | 'ar'
  ): Promise<AgentGenerationResult> {
    const startTime = Date.now();
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const toolExecutions: ToolCallExecution[] = [];

    const toolMap = new Map<string, IAgentTool>();
    for (const t of tools) {
      toolMap.set(t.definition.function.name, t);
    }

    // Helper to run tools and record execution
    const runTool = async (name: string, input: any) => {
      const tool = toolMap.get(name);
      if (!tool) return null;
      const tStart = Date.now();
      const output = await tool.execute(input);
      const durationMs = Date.now() - tStart;
      toolExecutions.push({ tool: name, input, output, durationMs });
      return output;
    };

    // 1. Execute Clinical Urgency Tool
    const urgencyResult = await runTool('evaluate_urgency', {
      symptomDescription: lastUserMessage,
    });

    const isEmergency = urgencyResult?.isEmergency ?? false;
    const isSecondOpinion = urgencyResult?.urgencyLevel === 'SECOND_OPINION' || /second opinion|رأي طبي ثان|stent|bypass|travel/i.test(lastUserMessage);

    // 2. Execute Doctor and Hospital search tools from DB
    const doctors = await runTool('search_doctors', {
      specialty: 'Cardiology',
      acceptsSecondOpinion: isSecondOpinion ? true : undefined,
    });

    let hospitals = null;
    if (isEmergency) {
      hospitals = await runTool('search_hospitals', {
        hasEmergencyOnly: true,
      });
    }

    let secondOpinionPkg = null;
    if (isSecondOpinion || !isEmergency) {
      secondOpinionPkg = await runTool('estimate_second_opinion', {
        destinationCountryCode: /germany|ألمانيا/i.test(lastUserMessage)
          ? 'DE'
          : /turkey|تركيا/i.test(lastUserMessage)
          ? 'TR'
          : 'UAE',
        procedureOrCondition: 'Chest Discomfort & Coronary Plaque Evaluation',
      });
    }

    // Construct grounded response
    let responseText = '';
    const suggestedQuestions: string[] = [];

    const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(lastUserMessage);

    if (isEmergency) {
      if (isArabic) {
        responseText = `⚠️ **تنبيه سريري عاجل (Emergency Triage):**\n` +
          `بناءً على الأعراض التي وصفتها، هناك مؤشرات خطورة تستوجب فحصًا فوريًا في قسم الطوارئ لاستبعاد أي متلازمة تاجية حادة.\n\n` +
          `🚨 **الإجراء الموصى به فورًا:**\n` +
          `1. التوقف التام عن أي نشاط أو مجهود بدني والجلوس بوضعية مريحة.\n` +
          `2. عدم قيادة السيارة بنفسك نهائيًا.\n` +
          `3. الاتصال بالإسعاف المحلي فورًا أو التوجه لأقرب مركز طوارئ مجهز بقسطرة قلبية 24/7.\n\n` +
          `🏥 **أقرب المراكز المعتمدة لحالات الطوارئ في شبكتنا:**\n` +
          (hospitals && hospitals.length > 0
            ? hospitals.slice(0, 2).map((h: any) => `• **${h.nameAr}** (${h.countryAr}) - خط الطوارئ: ${h.emergencyPhone} | اعتماد: ${h.accreditation}`).join('\n')
            : '• التوجه لأقرب مستشفى عام مجهز بقسم قسطرة قلبية.');
        suggestedQuestions.push('أنا في المستشفى حاليًا وأريد متابعة', 'الألم بدأ منذ أقل من 10 دقائق', 'أعاني من ضيق تنفس شديد');
      } else {
        responseText = `⚠️ **CRITICAL CLINICAL ALERT (Emergency Triage):**\n` +
          `Based on your symptom description, your symptoms exhibit acute cardiac red flags that require **immediate evaluation in an Emergency Department** to rule out an Acute Coronary Syndrome (ACS).\n\n` +
          `🚨 **Immediate Protocol:**\n` +
          `1. **Stop all exertion** immediately and sit or rest comfortably.\n` +
          `2. **Do NOT drive yourself** to the hospital.\n` +
          `3. **Call local emergency services (911 / 998 / 112) immediately** or have someone take you to the nearest accredited emergency center.\n\n` +
          `🏥 **Accredited 24/7 Emergency Cardiac Centers in Network:**\n` +
          (hospitals && hospitals.length > 0
            ? hospitals.slice(0, 2).map((h: any) => `• **${h.nameEn}** (${h.countryEn}) - Emergency Hotline: **${h.emergencyPhone}** | Accreditation: ${h.accreditation}`).join('\n')
            : '• Nearest local emergency hospital with a 24/7 cardiac catheterization lab.');
        suggestedQuestions.push('I am currently resting and pain is subsiding', 'Pain started 15 minutes ago with dizziness', 'I need immediate emergency contact');
      }
    } else {
      // Subacute or Decision Assistant (Cardiologist vs ER vs Second Opinion)
      const topDocs = doctors ? doctors.slice(0, 2) : [];
      if (isArabic) {
        responseText = `أهلًا بك في **HealTrip Patient Decision Assistant**.\n\n` +
          `بخصوص استفسارك حول ما إذا كان يجب مراجعة استشاري قلب، أو الذهاب للطوارئ، أو طلب رأي طبي ثانٍ:\n\n` +
          `🩺 **خلاصة التقييم السريري (Triage Guidance):**\n` +
          `• **متى تتوجه للطوارئ (ER) فورًا؟** إذا كان الألم ضاغطًا كالثقل، أو يمتد للذراع الأيسر أو الفك، أو يصاحبه ضيق تنفس أو عرق بارد.\n` +
          `• **متى تراجع استشاري قلب محليًا (Cardiologist)?** إذا كان الألم خفيفًا أو متقطعًا، أو مرتبطًا بمجهود تدريجي، بهدف إجراء تخطيط قلب (ECG) وفحص إنزيمات وإيكو سريري اليوم.\n` +
          `• **متى تطلب رأيًا طبيًا ثانيًا (Second Opinion via HealTrip)?** إذا كنت قد أجريت الفحوصات بالفعل، أو تم اقتراح قسطرة/دعامات أو عملية جراحية، وترغب بمراجعة الخطة مع مراكز عالمية رائدة (مثل ألمانيا، تركيا، أو الإمارات) لاختيار أفضل بديل علاجي.\n\n` +
          `👨‍⚕️ **أطباء استشاريون معتمدون في قاعدة بياناتنا:**\n` +
          topDocs.map((d: any) => `• **${d.nameAr}** (${d.titleAr}) في *${d.hospitalNameAr}* - خبرة ${d.yearsOfExperience} عامًا | تقييم: ⭐ ${d.rating} | استشارة الرأي الثاني: $${d.consultationFeeUsd}`).join('\n') +
          `\n\n🌐 **حزم الرأي الطبي الثاني عبر HealTrip:**\n` +
          (secondOpinionPkg
            ? `• الوجهة: **${secondOpinionPkg.selectedDestination}** (${secondOpinionPkg.recommendedBoard})\n• التكلفة التقديرية: **${secondOpinionPkg.estimatedReviewFeeUsd}** | الإنجاز خلال: **${secondOpinionPkg.typicalTurnaroundDays}**\n• الملفات المطلوبة: ${secondOpinionPkg.requiredClinicalDocuments.slice(0, 2).join('، ')}.`
            : '');

        suggestedQuestions.push('الألم يمتد إلى الذراع الأيسر والفك', 'الألم متقطع ومستقر، أبحث عن رأي ثانٍ لعملية قسطرة', 'كيف أرفع تقارير تخطيط القلب والإيكو؟');
      } else {
        responseText = `Welcome to the **HealTrip Patient Decision Assistant**.\n\n` +
          `Regarding your decision between **Cardiologist vs. Emergency Room (ER) vs. Second Opinion**:\n\n` +
          `🩺 **Clinical Triage Decision Framework:**\n` +
          `• **Go to the ER Immediately if:** You feel heavy crushing pressure, or if pain radiates to your left arm, neck, or jaw, or is accompanied by shortness of breath or cold sweats.\n` +
          `• **See an Outpatient Cardiologist if:** Your symptoms are stable, mild, or intermittent (e.g. noticed over several weeks) and you require an in-person resting ECG, Echocardiogram, and stress test.\n` +
          `• **Seek a Second Opinion via HealTrip if:** You have already had diagnostic imaging (such as an angiogram or CT scan), were advised to undergo stenting or open-heart bypass (CABG), and want an independent international review by leading centers (in Germany, Turkey, or UAE) before committing to a major procedure.\n\n` +
          `👨‍⚕️ **Accredited Specialists Retrieved from Verified Directory:**\n` +
          topDocs.map((d: any) => `• **${d.nameEn}** (${d.titleEn}) at *${d.hospitalNameEn}* (${d.hospitalCountry}) - ${d.yearsOfExperience} yrs experience | Rating: ⭐ ${d.rating} | Second Opinion Fee: $${d.consultationFeeUsd}`).join('\n') +
          `\n\n🌐 **HealTrip Cross-Border Second Opinion Review:**\n` +
          (secondOpinionPkg
            ? `• Recommended Medical Hub: **${secondOpinionPkg.selectedDestination}** (${secondOpinionPkg.recommendedBoard})\n• Estimated Review Fee: **${secondOpinionPkg.estimatedReviewFeeUsd}** | Turnaround: **${secondOpinionPkg.typicalTurnaroundDays}**\n• Key Requirements: ${secondOpinionPkg.requiredClinicalDocuments.slice(0, 2).join(' and ')}.`
            : '');

        suggestedQuestions.push(
          'Does the pain radiate to your left arm or jaw?',
          'The pain is stable; I have an angiogram CD for a second opinion',
          'What are the requirements for a German second opinion board?'
        );
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      content: responseText,
      toolExecutions,
      suggestedQuestions,
      providerUsed: 'simulation',
      latencyMs,
    };
  }
}
