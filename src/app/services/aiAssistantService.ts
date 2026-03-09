type AssistantRole = 'user' | 'assistant';

export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export interface AssistantAction {
  type: 'navigate';
  path: string;
}

export interface AssistantReply {
  text: string;
  action?: AssistantAction | null;
}

const FALLBACK_SYSTEM_PROMPT =
  'You are PetMat assistant. Be concise, helpful, and action-oriented. Always answer in Arabic if the user writes Arabic.';

const API_BASE_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/$/, '');

const containsAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const localSmartReply = (question: string): string => {
  const text = question.toLowerCase();

  if (containsAny(text, ['شات', 'chat', 'رسائل', 'message'])) {
    return 'تقدر تفتح الشات من صفحة المجتمع عبر /community-support/chat. ولو عايز دعم فني سريع: افتح خدمة العملاء وأرسل تذكرة من /community-support.';
  }

  if (containsAny(text, ['دعم', 'support', 'مشكلة', 'help'])) {
    return 'للدعم الفني: افتح /community-support ثم قدّم تذكرة. فريق الإدارة يراجعها من لوحة الدعم، وتقدر تتابع الردود مباشرة.';
  }

  if (containsAny(text, ['مطابقة', 'match', 'ai'])) {
    return 'للمطابقة الذكية: ادخل /ai. ولو عايز توصية صحية لحيوانك، ادخل سجل الصحة أو AI health check من لوحة التحكم.';
  }

  if (containsAny(text, ['متجر', 'market', 'شراء', 'seller'])) {
    return 'المتجر في /marketplace، السلة في /marketplace/cart، ولو بائع فلوحتك في /marketplace/seller.';
  }

  if (containsAny(text, ['تسجيل', 'login', 'register', 'حساب'])) {
    return 'تسجيل الدخول من /login وإنشاء حساب من /register. بعد الدخول، كل ميزات الدعم والشات هتظهر بشكل كامل.';
  }

  return 'أنا مساعد PetMat 🤖. أقدر أساعدك في: الشات، الدعم الفني، المطابقة الذكية، والمتجر. قلّي عايز توصل لإيه بالضبط وأنا أديك الطريق خطوة بخطوة.';
};

const extractTextFromApiResponse = (payload: any): string | null => {
  if (!payload) return null;

  const direct = payload?.reply || payload?.answer || payload?.text || payload?.message;
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim();
  }

  const openAiLike = payload?.choices?.[0]?.message?.content;
  if (typeof openAiLike === 'string' && openAiLike.trim()) {
    return openAiLike.trim();
  }

  return null;
};

const callExternalAssistantApi = async (userMessage: string, history: AssistantMessage[]): Promise<AssistantReply | null> => {
  try {
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
    const normalizedHistory = history
      .map((item) => ({ role: item.role, content: String(item.content || '').trim() }))
      .filter((item) => item.content.length > 0)
      .slice(-10);

    const dedupedHistory =
      normalizedHistory.length > 0 &&
      normalizedHistory[normalizedHistory.length - 1].role === 'user' &&
      normalizedHistory[normalizedHistory.length - 1].content === userMessage.trim()
        ? normalizedHistory.slice(0, -1)
        : normalizedHistory;

    const response = await fetch(`${API_BASE_URL}/ai/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        message: userMessage,
        history: dedupedHistory,
      }),
    });

    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    const text = extractTextFromApiResponse(payload);
    if (!text) return null;

    return {
      text,
      action: payload?.action && payload.action.type === 'navigate' ? payload.action : null,
    };
  } catch {
    return null;
  }
};

export const aiAssistantService = {
  async getReply(userMessage: string, history: AssistantMessage[]): Promise<AssistantReply> {
    const external = await callExternalAssistantApi(userMessage, history);
    if (external) return external;
    return { text: localSmartReply(userMessage), action: null };
  },
};
