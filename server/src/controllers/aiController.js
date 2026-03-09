import prisma from '../prisma/client.js';
import { getBestMatches } from '../ai/matchingEngine.js';
import { AppError } from '../utils/appError.js';
import { createNotificationForUser } from './notificationController.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const daysSince = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / DAY_MS);
};

const formatDate = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const normalizeArabic = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s/:-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const buildGuidedReply = (title, steps, nextPrompt = 'لو تحب، أقدر أمشي معاك خطوة بخطوة.') => {
  const numbered = steps.map((step, index) => `${index + 1}) ${step}`).join('\n');
  return `${title}\n${numbered}\n\n${nextPrompt}`;
};

const inferIntent = (text) => {
  const intents = [
    {
      key: 'greeting',
      keywords: ['اهلا', 'مرحبا', 'هاي', 'hello', 'hi', 'ازيك', 'السلام عليكم'],
    },
    {
      key: 'support',
      keywords: ['دعم', 'مشكله', 'مساعده', 'support', 'ticket', 'تذكره', 'بلاغ', 'خدمه العملاء', 'خدمة العملاء', 'العملاء', 'خدمه'],
    },
    {
      key: 'chat',
      keywords: ['شات', 'رسائل', 'chat', 'message', 'محادثه'],
    },
    {
      key: 'marketplace',
      keywords: ['متجر', 'market', 'شراء', 'seller', 'بائع', 'سله', 'cart'],
    },
    {
      key: 'matching',
      keywords: ['مطابقه', 'match', 'ai', 'ذكاء', 'تزويج'],
    },
    {
      key: 'account',
      keywords: ['تسجيل', 'login', 'register', 'حساب', 'password', 'كلمه مرور'],
    },
    {
      key: 'admin',
      keywords: ['ادمن', 'admin', 'super admin', 'لوحه التحكم', 'dashboard'],
    },
  ];

  let best = { key: 'unknown', score: 0 };
  for (const intent of intents) {
    const score = intent.keywords.filter((keyword) => text.includes(keyword)).length;
    if (score > best.score) {
      best = { key: intent.key, score };
    }
  }

  return best.key;
};

const isFollowUpQuestion = (text) =>
  hasAny(text, ['فين', 'فينه', 'ازاي', 'كيف', 'طب', 'تمام', 'يعني', 'طيب', 'more', 'again']);

const resolveIntentWithHistory = (prompt, history = []) => {
  const text = normalizeArabic(prompt);
  const lastUser = [...history]
    .reverse()
    .find((item) => item?.role === 'user' && typeof item?.content === 'string');
  const lastUserText = normalizeArabic(lastUser?.content || '');

  let intent = inferIntent(text);
  if (intent === 'unknown' && isFollowUpQuestion(text) && lastUserText) {
    intent = inferIntent(lastUserText);
  }

  return intent;
};

const actionFromIntent = (intent) => {
  if (intent === 'support') return { type: 'navigate', path: '/community-support' };
  if (intent === 'chat') return { type: 'navigate', path: '/community-support/chat' };
  if (intent === 'marketplace') return { type: 'navigate', path: '/marketplace' };
  if (intent === 'matching') return { type: 'navigate', path: '/ai' };
  if (intent === 'account') return { type: 'navigate', path: '/login' };
  if (intent === 'admin') return { type: 'navigate', path: '/admin' };
  return null;
};

const assistantFallbackReply = (prompt, history = []) => {
  const intent = resolveIntentWithHistory(prompt, history);

  if (intent === 'greeting') {
    return 'أهلًا 👋 أنا مساعد PetMat. أقدر أساعدك في: الشات، الدعم الفني، المطابقة الذكية، المتجر، والحساب. قولّي عايز تعمل إيه بالضبط.';
  }

  if (intent === 'support') {
    return buildGuidedReply('دي أسرع طريقة للوصول للدعم الفني:', [
      'ادخل على /community-support',
      'اختَر نوع المشكلة واكتب التفاصيل',
      'ابعث التذكرة وانتظر رد الأدمن من لوحة الدعم',
      'لو محتاج محادثة مباشرة، افتح /community-support/chat',
    ]);
  }

  if (intent === 'chat') {
    return buildGuidedReply('الشات متاح حاليًا بطريقتين:', [
      'Popup عائم أسفل يمين الشاشة (زر الرسائل)',
      'صفحة الشات المباشرة: /community-support/chat',
      'لو مش ظاهر، اعمل Refresh وتأكد أنك logged in',
    ]);
  }

  if (intent === 'marketplace') {
    return buildGuidedReply('مسارات المتجر:', [
      'المنتجات: /marketplace',
      'السلة والدفع: /marketplace/cart',
      'لوحة البائع: /marketplace/seller',
    ]);
  }

  if (intent === 'matching') {
    return buildGuidedReply('للمطابقة الذكية:', [
      'افتح صفحة AI: /ai',
      'اختر الحيوان المطلوب',
      'راجع النتائج والتوصيات',
      'لو عايز فحص صحي ذكي استخدم health check من لوحة الحساب',
    ]);
  }

  if (intent === 'account') {
    return buildGuidedReply('الحساب وتسجيل الدخول:', [
      'تسجيل الدخول: /login',
      'إنشاء حساب جديد: /register',
      'بعد الدخول هتظهر كل المزايا المقيدة بالصلاحيات',
    ]);
  }

  if (intent === 'admin') {
    return buildGuidedReply('لوحات الإدارة:', [
      'لوحة الإدارة: /admin',
      'سوبر أدمن: /super-admin',
      'لوحة AI: /ai-dashboard',
      'مراجعة المدفوعات: /admin/payments',
    ]);
  }

  return buildGuidedReply('ممكن أساعدك بسرعة، اختر اللي محتاجه:', [
    'الدعم الفني والتذاكر',
    'فتح الشات المباشر',
    'المطابقة الذكية',
    'المتجر والطلبات',
  ]);
};

const extractAssistantReply = (payload) => {
  if (!payload) return null;

  const direct = payload?.reply || payload?.answer || payload?.message || payload?.text;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  const openAiLike = payload?.choices?.[0]?.message?.content;
  if (typeof openAiLike === 'string' && openAiLike.trim()) {
    return openAiLike.trim();
  }

  return null;
};

export const aiAssistantChat = async (req, res) => {
  const { message, history = [] } = req.body;

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_CHAT_API_KEY;
  const model = process.env.OPENAI_MODEL || process.env.AI_CHAT_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.OPENAI_BASE_URL || process.env.AI_CHAT_API_URL || 'https://api.openai.com/v1/chat/completions';

  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (item) =>
            item &&
            ['user', 'assistant', 'system'].includes(item.role) &&
            typeof item.content === 'string' &&
            item.content.trim().length > 0
        )
        .slice(-12)
    : [];

  const detectedIntent = resolveIntentWithHistory(message, safeHistory);
  const action = actionFromIntent(detectedIntent);

  if (!apiKey) {
    return res.json({ success: true, reply: assistantFallbackReply(message, safeHistory), source: 'fallback', action });
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are PetMat AI assistant. Give concise and practical answers. If user writes Arabic, respond in Arabic.',
          },
          ...safeHistory,
          ...(safeHistory.at(-1)?.role === 'user' && safeHistory.at(-1)?.content === message
            ? []
            : [{ role: 'user', content: message }]),
        ],
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text().catch(() => '');
      return res.json({
        success: true,
        reply: assistantFallbackReply(message, safeHistory),
        source: 'fallback',
        action,
        error: errorPayload || 'Provider request failed',
      });
    }

    const payload = await response.json().catch(() => null);
    const reply = extractAssistantReply(payload) || assistantFallbackReply(message, safeHistory);

    return res.json({ success: true, reply, source: 'provider', action });
  } catch (error) {
    return res.json({
      success: true,
      reply: assistantFallbackReply(message, safeHistory),
      source: 'fallback',
      action,
      error: error.message,
    });
  }
};

export const aiMatchByPet = async (req, res) => {
  const { petId } = req.params;

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { ownerId: true } });
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') throw new AppError('Forbidden', 403);

  const matches = await getBestMatches(petId);

  await Promise.all(
    matches.map((m) =>
      prisma.aIMatch.upsert({
        where: { id: `${petId}-${m.pet.id}`.slice(0, 36) },
        create: {
          id: `${petId}-${m.pet.id}`.slice(0, 36),
          pet1Id: petId,
          pet2Id: m.pet.id,
          score: m.score,
          notes: m.notes,
        },
        update: {
          score: m.score,
          notes: m.notes,
        },
      }).catch(() => null)
    )
  );

  res.json({ bestMatches: matches });
};

export const aiHealthCheckByPet = async (req, res) => {
  const { petId } = req.params;
  const shouldNotify = String(req.query.notify ?? 'true').toLowerCase() !== 'false';

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: { healthRecords: { orderBy: { date: 'desc' }, take: 20 } },
  });

  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.ownerId !== req.user.id && req.user.role !== 'admin') throw new AppError('Forbidden', 403);

  const records = Array.isArray(pet.healthRecords) ? pet.healthRecords : [];
  const latestRecord = records[0] || null;
  const latestVaccineRecord = records.find((item) => Boolean(item.vaccine)) || null;

  const daysFromLastCheck = daysSince(latestRecord?.date);
  const daysFromLastVaccine = daysSince(latestVaccineRecord?.date);

  const needsVaccination = daysFromLastVaccine == null || daysFromLastVaccine >= 365;
  const needsVetVisit = daysFromLastCheck == null || daysFromLastCheck >= 180;

  let urgency = 'LOW';
  if (needsVaccination || needsVetVisit) urgency = 'MEDIUM';
  if ((daysFromLastVaccine != null && daysFromLastVaccine >= 395) || (daysFromLastCheck != null && daysFromLastCheck >= 240)) {
    urgency = 'HIGH';
  }

  const reasons = [];
  if (daysFromLastVaccine == null) {
    reasons.push('لا يوجد سجل تطعيم سابق لهذا الحيوان.');
  } else if (needsVaccination) {
    reasons.push(`مر ${daysFromLastVaccine} يوم على آخر تطعيم، ويفضل تجديد التطعيم الآن.`);
  }

  if (daysFromLastCheck == null) {
    reasons.push('لا يوجد سجل كشف بيطري سابق لهذا الحيوان.');
  } else if (needsVetVisit) {
    reasons.push(`مر ${daysFromLastCheck} يوم على آخر كشف بيطري، ويفضل حجز زيارة متابعة.`);
  }

  if (!needsVaccination && !needsVetVisit) {
    reasons.push('السجل الصحي جيد حاليًا ولا توجد حاجة عاجلة للتطعيم أو الزيارة البيطرية.');
  }

  const suggestedActions = [];
  if (needsVaccination) suggestedActions.push('حجز تطعيم خلال 7 أيام.');
  if (needsVetVisit) suggestedActions.push('حجز فحص بيطري دوري خلال 7 أيام.');
  if (!needsVaccination && !needsVetVisit) suggestedActions.push('الاستمرار على جدول المتابعة الحالي.');

  const recommendation = {
    petId,
    petName: pet.name,
    needsVaccination,
    needsVetVisit,
    urgency,
    daysFromLastVaccine,
    daysFromLastCheck,
    lastVaccineDate: formatDate(latestVaccineRecord?.date),
    lastHealthCheckDate: formatDate(latestRecord?.date),
    reasons,
    suggestedActions,
    generatedAt: new Date().toISOString(),
  };

  let notificationCreated = null;
  if (shouldNotify && (needsVaccination || needsVetVisit)) {
    notificationCreated = createNotificationForUser({
      userId: pet.ownerId,
      title: `AI Health Alert - ${pet.name}`,
      message: reasons.join(' '),
      type: 'WARNING',
      priority: urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
    });
  }

  res.json({ success: true, data: recommendation, notificationCreated });
};
