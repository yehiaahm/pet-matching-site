/**
 * Advanced AI Matching Service - Enhanced Version
 * Uses multi-factor analysis for intelligent pet breeding matching
 */

import { Pet } from '../App';

export interface EnhancedMatchScore {
  totalScore: number;
  geneticScore: number;
  healthScore: number;
  behaviorScore: number;
  locationScore: number;
  ageCompatibilityScore: number;
  breedPurityScore: number;
  previousSuccessScore: number;
  factors: {
    category: string;
    explanation: string;
    score: number;
    weight: number;
  }[];
  recommendation: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

/**
 * AI Matching Engine - Multiple factor analysis
 */
export class AIMatchingEngine {
  // الأوزان المستخدمة في الحساب (يجب أن تجمع إلى 100)
  private readonly weights = {
    genetic: 0.25,       // 25% - التوافق الجيني
    health: 0.20,        // 20% - الصحة والتحصينات
    behavior: 0.15,      // 15% - السلوك المتوافق
    location: 0.15,      // 15% - القرب الجغرافي
    age: 0.10,           // 10% - توافق العمر
    breedPurity: 0.10,   // 10% - نقاء السلالة
    history: 0.05,       // 5% - سجل النجاح السابق
  };

  /**
   * حساب درجة التوافق الجيني (يعتمد على نقاء السلالة والتنوع الجيني)
   */
  calculateGeneticScore(petA: Pet, petB: Pet): number {
    let score = 0;

    // نفس السلالة = 80 نقطة
    if (petA.breed === petB.breed) {
      score += 80;
    }
    // سلالات متقاربة = 60 نقطة
    else if (this.areBreedsCompatible(petA.breed, petB.breed)) {
      score += 60;
    }
    // سلالات مختلفة = 40 نقطة
    else {
      score += 40;
    }

    // التنوع الجيني المثالي (الأنثى أصغر من الذكر)
    if (petA.gender === 'female' && petB.gender === 'male') {
      score += 10;
    } else if (petA.gender === 'male' && petB.gender === 'female') {
      score += 5; // أقل مثالية
    }

    // سجل التحصينات = نقاط إضافية
    if (petA.vaccinations && petA.vaccinations.length > 0 &&
        petB.vaccinations && petB.vaccinations.length > 0) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * حساب درجة الصحة
   */
  calculateHealthScore(petA: Pet, petB: Pet): number {
    let score = 50; // درجة أساسية

    // فحص صحي حديث = +25
    if (petA.healthCheck && petB.healthCheck) {
      const checkDateA = new Date(petA.healthCheck.date).getTime();
      const checkDateB = new Date(petB.healthCheck.date).getTime();
      const now = new Date().getTime();
      const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;

      if (now - checkDateA < sixMonths && now - checkDateB < sixMonths) {
        score += 25;
      } else {
        score += 10;
      }
    }

    // تحصينات محدثة = +15
    if (petA.vaccinations?.length && petB.vaccinations?.length) {
      score += 15;
    }

    // عمر الحيوان الصحي (من 1.5 إلى 7 سنوات للتكاثر) = +10
    if (petA.age >= 1.5 && petA.age <= 7 && petB.age >= 1.5 && petB.age <= 7) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * حساب توافق السلوك (بناءً على الوصف والتقييمات)
   */
  calculateBehaviorScore(petA: Pet, petB: Pet): number {
    let score = 50; // درجة أساسية

    // تقييمات عالية من المالك = +25
    if (petA.owner.rating >= 4.5 && petB.owner.rating >= 4.5) {
      score += 25;
    } else if (petA.owner.rating >= 4 && petB.owner.rating >= 4) {
      score += 15;
    }

    // مالكون موثقون = +15
    if (petA.owner.verified && petB.owner.verified) {
      score += 15;
    }

    // وصف إيجابي في السجل = +10
    const positiveKeywords = ['friendly', 'calm', 'gentle', 'obedient', 'sociable', 'well-behaved'];
    const descA = (petA.description || '').toLowerCase();
    const descB = (petB.description || '').toLowerCase();
    if (positiveKeywords.some(k => descA.includes(k)) &&
        positiveKeywords.some(k => descB.includes(k))) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * حساب درجة القرب الجغرافي
   */
  calculateLocationScore(petA: Pet, petB: Pet): number {
    let score = 0;
    
    // نفس المحافظة = 80 نقطة
    if (petA.owner.address?.split('-')[0] === petB.owner.address?.split('-')[0]) {
      score = 80;
    }
    // محافظات قريبة = 50 نقطة
    else if (this.areLocationsNear(petA.owner.address, petB.owner.address)) {
      score = 50;
    }
    // مسافة متوسطة = 30 نقطة
    else {
      score = 30;
    }

    return score;
  }

  /**
   * حساب توافق العمر
   */
  calculateAgeCompatibilityScore(petA: Pet, petB: Pet): number {
    const ageDifference = Math.abs(petA.age - petB.age);

    // نفس العمر = 100
    if (ageDifference === 0) return 100;
    // فرق عام واحد = 90
    if (ageDifference <= 1) return 90;
    // فرق سنتين = 80
    if (ageDifference <= 2) return 80;
    // فرق 3 سنوات = 60
    if (ageDifference <= 3) return 60;
    // فرق أكثر من 4 سنوات = 40
    return 40;
  }

  /**
   * حساب نقاء السلالة
   */
  calculateBreedPurityScore(petA: Pet, petB: Pet): number {
    let score = 50;

    // كلاهما من نفس السلالة النقية = +40
    if (petA.breed === petB.breed && petA.breed.length > 3) {
      score += 40;
    }

    // وثائق أصلية معتمدة = +10
    if (petA.verified && petB.verified) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * حساب درجة سجل النجاح السابق
   */
  calculateHistoryScore(petA: Pet, petB: Pet): number {
    let score = 0;

    // عدد المطابقات السابقة الناجحة
    const totalMatchesA = (petA.owner as any).totalMatches || 0;
    const totalMatchesB = (petB.owner as any).totalMatches || 0;

    // كل مطابقة ناجحة = نقطة واحدة (حد أقصى 50)
    score = Math.min((totalMatchesA + totalMatchesB) / 2, 50);

    return score;
  }

  /**
   * الحساب النهائي الشامل
   */
  calculateComprehensiveScore(petA: Pet, petB: Pet): EnhancedMatchScore {
    const scores = {
      genetic: this.calculateGeneticScore(petA, petB),
      health: this.calculateHealthScore(petA, petB),
      behavior: this.calculateBehaviorScore(petA, petB),
      location: this.calculateLocationScore(petA, petB),
      age: this.calculateAgeCompatibilityScore(petA, petB),
      breedPurity: this.calculateBreedPurityScore(petA, petB),
      history: this.calculateHistoryScore(petA, petB),
    };

    // الحساب المرجح
    const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * this.weights[key as keyof typeof this.weights]);
    }, 0);

    // تحديد مستوى الثقة
    let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
    if (totalScore >= 75) confidenceLevel = 'high';
    else if (totalScore >= 50) confidenceLevel = 'medium';

    // العوامل المؤثرة
    const factors = Object.entries(scores).map(([category, score]) => ({
      category,
      score: Math.round(score),
      weight: Math.round(this.weights[category as keyof typeof this.weights] * 100),
      explanation: this.generateExplanation(category, score, petA, petB),
    }));

    return {
      totalScore: Math.round(totalScore),
      geneticScore: scores.genetic,
      healthScore: scores.health,
      behaviorScore: scores.behavior,
      locationScore: scores.location,
      ageCompatibilityScore: scores.age,
      breedPurityScore: scores.breedPurity,
      previousSuccessScore: scores.history,
      factors,
      recommendation: this.generateRecommendation(totalScore, confidenceLevel),
      confidenceLevel,
    };
  }

  /**
   * توليد شرح مفصل لكل عامل
   */
  private generateExplanation(category: string, score: number, petA: Pet, petB: Pet): string {
    const explanations: Record<string, string> = {
      genetic: score >= 80 ? `سلالات متوافقة جداً: ${petA.breed} + ${petB.breed}` : `توافق سلالات متوسط`,
      health: score >= 80 ? 'كلا الحيوانين لديهما فحوصات صحية حديثة وتحصينات محدثة' : 'يوصى بفحص صحي إضافي',
      behavior: score >= 80 ? `كلاهما لديه تقييمات عالية من المالكين (${petA.owner.rating}⭐, ${petB.owner.rating}⭐)` : 'سلوك متوسط التوافق',
      location: score >= 80 ? `بنفس المحافظة - تسهل المراجعات` : score >= 50 ? `قريبان جغرافياً` : 'مسافة متوسطة بينهما',
      age: score >= 90 ? `أعمار متقاربة جداً: ${petA.age} و ${petB.age} سنة` : `أعمار متوافقة: ${petA.age} و ${petB.age} سنة`,
      breedPurity: score >= 80 ? 'سلالات نقية موثقة' : 'توافق جيد في نقاء السلالة',
      history: score >= 50 ? `خبرة عالية: ${(petA.owner as any).totalMatches || 0} مطابقات سابقة` : 'مطابقة جديدة - منصة موثوقة',
    };

    return explanations[category] || 'توافق عام جيد';
  }

  /**
   * توليد توصية شاملة
   */
  private generateRecommendation(score: number, confidence: string): string {
    if (score >= 85 && confidence === 'high') {
      return '🌟 مطابقة ممتازة جداً! توافق عالي في جميع المعايير. يُنصح بالمتابعة الفورية.';
    } else if (score >= 70 && confidence === 'high') {
      return '✨ مطابقة جيدة! معايير قوية وموثوقة. ننصح بالتقدم إلى الخطوة التالية.';
    } else if (score >= 50 && confidence === 'medium') {
      return '👍 مطابقة واعدة. يُنصح بإجراء فحص صحي إضافي والتواصل مع المالك.';
    } else {
      return '⚠️ مطابقة متوسطة. قد تحتاج إلى مراجعة معايير أخرى.';
    }
  }

  /**
   * فحص توافق السلالات
   */
  private areBreedsCompatible(breed1: string, breed2: string): boolean {
    const compatibleGroups = [
      ['Golden Retriever', 'Labrador', 'German Shepherd'],
      ['Persian', 'Siamese', 'Turkish Angora'],
      ['Poodle', 'Shih Tzu', 'Maltese'],
    ];

    for (const group of compatibleGroups) {
      if (group.includes(breed1) && group.includes(breed2)) {
        return true;
      }
    }
    return false;
  }

  /**
   * فحص القرب الجغرافي
   */
  private areLocationsNear(addr1: string, addr2: string): boolean {
    const nearbyLocations: Record<string, string[]> = {
      'Cairo': ['Giza', 'Cairo'],
      'Alexandria': ['Alexandria', 'Behira'],
      'Giza': ['Cairo', 'Giza'],
    };

    const loc1 = addr1?.split('-')[0] || '';
    const loc2 = addr2?.split('-')[0] || '';

    return (nearbyLocations[loc1] || []).includes(loc2) ||
           (nearbyLocations[loc2] || []).includes(loc1);
  }
}

// تصدير مثيل واحد من المحرك
export const aiMatchingEngine = new AIMatchingEngine();
