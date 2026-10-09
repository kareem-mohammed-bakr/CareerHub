import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LocalCareerGuideProvider, type GuideReply } from '../core/careerGuideEngine.mjs';
import { useLocale } from '../core/i18n';

type Language = 'en' | 'ar';
const localGuide = new LocalCareerGuideProvider();

export function CareerGuide() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ question: string; reply: GuideReply }>>([]);
  const messageListRef = useRef<HTMLDivElement>(null);
  const language: Language = locale;
  const isArabic = locale === 'ar';
  const prompts = isArabic
    ? ['إزاي أبحث عن وظيفة؟', 'أتابع طلباتي إزاي؟', 'هل محدد المواقع متاح؟']
    : ['How do I search for a job?', 'How do I track applications?', 'Is Career Locator available?'];

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function ask(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setMessages((current) => [...current, { question: clean, reply: localGuide.answer(clean, language) }]);
    setQuestion('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  function changeLanguage(next: Language) {
    setLocale(next);
  }

  return <aside className="career-guide" aria-label={isArabic ? 'مساعد CareerHub' : 'CareerHub guide'} dir={isArabic ? 'rtl' : 'ltr'}>
    {open && <section className="career-guide-panel" aria-labelledby="career-guide-title">
      <header className="career-guide-header"><div><span className="career-guide-mark" aria-hidden="true">C</span><div><h2 id="career-guide-title">{isArabic ? 'دليل CareerHub' : 'CareerHub guide'}</h2><p>{isArabic ? 'إجابات من النسخة الحالية' : 'Answers about this build'}</p></div></div>
        <label className="career-guide-language"><span>{isArabic ? 'اللغة' : 'Language'}</span><select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} aria-label={isArabic ? 'لغة الإجابة' : 'Answer language'}><option value="en">English</option><option value="ar">العربية</option></select></label>
        <button type="button" className="career-guide-close" onClick={() => setOpen(false)} aria-label={isArabic ? 'إغلاق الدليل' : 'Close guide'}>×</button>
      </header>
      <p className="career-guide-disclaimer">{isArabic ? 'دليل محلي موثق · لا يوجد مزود ذكاء اصطناعي متصل.' : 'Verified local guide · no AI provider is connected.'}</p>
      <div className="career-guide-messages" aria-live="polite" ref={messageListRef}>
        {messages.length === 0 && <p className="career-guide-welcome">{isArabic ? 'اسأل عن طريقة استخدام CareerHub. سأوضح لك المتاح في المعاينة وما يحتاج إلى إعداد.' : 'Ask how to use CareerHub. I’ll explain what works in this preview and what still needs setup.'}</p>}
        {messages.map((item, index) => <article className="career-guide-message" key={`${index}-${item.question}`}><p className="career-guide-question">{item.question}</p><p>{item.reply.text}</p>{item.reply.href && <a href={item.reply.href}>{item.reply.link} <span aria-hidden="true">↗</span></a>}</article>)}
      </div>
      <div className="career-guide-prompts">{prompts.map((prompt) => <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div>
      <form className="career-guide-form" onSubmit={submit}><label className="sr-only" htmlFor="career-guide-question">{isArabic ? 'اكتب سؤالك' : 'Ask a question'}</label><input id="career-guide-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={240} placeholder={isArabic ? 'اكتب سؤالك هنا…' : 'Ask about the current preview…'} /><button type="submit" disabled={!question.trim()} aria-label={isArabic ? 'إرسال السؤال' : 'Send question'}>↑</button></form>
    </section>}
    <button type="button" className="career-guide-launcher" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span aria-hidden="true">{open ? '×' : '✳'}</span>{open ? (isArabic ? 'إغلاق الدليل' : 'Close guide') : (isArabic ? 'اسأل CareerHub' : 'Ask CareerHub')}</button>
  </aside>;
}
