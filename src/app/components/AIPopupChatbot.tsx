import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useLanguage } from '../context/LanguageContext';
import { aiAssistantService, type AssistantMessage } from '../services/aiAssistantService';

export function AIPopupChatbot() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        language === 'ar'
          ? 'مرحبًا 👋 أنا مساعد PetMat الذكي. اسألني عن الدعم، الشات، المطابقة، أو المتجر.'
          : 'Hi 👋 I am PetMat AI Assistant. Ask me about support, chat, matching, or marketplace.',
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isLoading]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    const nextMessages: AssistantMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const history = nextMessages.filter((item) => item.role === 'assistant' || item.role === 'user').slice(-8);
      const result = await aiAssistantService.getReply(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.text }]);

      if (result.action?.type === 'navigate' && result.action.path) {
        setTimeout(() => {
          navigate(result.action.path);
        }, 150);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            language === 'ar'
              ? 'حصلت مشكلة مؤقتة في الرد، جرّب تاني بعد لحظات.'
              : 'Temporary reply issue, please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)]">
          <Card className="shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">PetMat AI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div ref={listRef} className="h-80 overflow-y-auto p-3 space-y-2 bg-slate-50">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'ml-auto bg-indigo-600 text-white'
                      : 'mr-auto bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {isLoading && (
                <div className="mr-auto bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'ar' ? 'بفكر...' : 'Thinking...'}
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={language === 'ar' ? 'اكتب سؤالك...' : 'Type your question...'}
              />
              <Button onClick={() => void sendMessage()} disabled={!canSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-[55]">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          size="lg"
          className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
          aria-label="Open AI chatbot"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>
    </>
  );
}
