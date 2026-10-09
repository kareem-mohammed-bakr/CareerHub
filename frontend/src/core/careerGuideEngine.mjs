const content = {
  search: {
    en: { text: 'Open Find a job and use the title, skill, location, category, and work-style filters. When the live API is configured, the page searches published CareerHub roles; otherwise it clearly labels the listings as illustrative samples.', href: './careerhub.html#roles', link: 'Search CareerHub roles' },
    ar: { text: 'افتح «ابحث عن وظيفة» واستخدم عوامل تصفية المسمى والمهارة والموقع والتصنيف ونمط العمل. عند إعداد الـAPI المباشر، تعرض الصفحة وظائف CareerHub المنشورة؛ وإلا فستوضح أن القوائم أمثلة توضيحية.', href: './careerhub.html#roles', link: 'ابحث في وظائف CareerHub' },
  },
  apply: {
    en: { text: 'Illustrative sample roles cannot accept applications. For a published role from the live API, sign in with a job-seeker account and use Submit application. Account-submitted applications and their real statuses appear in the account tracker when the API is configured.', href: './careerhub.html#roles', link: 'Review available roles' },
    ar: { text: 'الوظائف التجريبية لا تستقبل طلبات. للتقديم على وظيفة منشورة عبر الـAPI المباشر، سجّل الدخول بحساب باحث عن عمل واختر «إرسال طلب التوظيف». تظهر الطلبات المرسلة وحالاتها الفعلية في متابعة الحساب عند إعداد الـAPI.', href: './careerhub.html#roles', link: 'راجع الوظائف المتاحة' },
  },
  tracking: {
    en: { text: 'In Application Tracker, manual planning entries stay in this browser and can be exported as CSV. When the API is configured, sign in to see applications submitted through CareerHub and the statuses returned by the platform.', href: './tracker.html', link: 'Open Application Tracker' },
    ar: { text: 'في «متابعة الطلبات»، تبقى إدخالات التخطيط اليدوية في هذا المتصفح ويمكن تصديرها بصيغة CSV. عند إعداد الـAPI، سجّل الدخول لعرض الطلبات المرسلة عبر CareerHub والحالات التي تعيدها المنصة.', href: './tracker.html', link: 'افتح متابعة الطلبات' },
  },
  locator: {
    en: { text: 'Career Locator is not available in this build. The location field only filters the illustrative sample roles; there is no geolocation service or verified global job feed.', href: './careerhub.html#roles', link: 'See location filters' },
    ar: { text: 'ميزة محدد المواقع الوظيفية غير متاحة في هذه النسخة. خانة الموقع تصفّي الوظائف التجريبية فقط؛ ولا توجد خدمة تحديد موقع أو قاعدة وظائف عالمية موثقة.', href: './careerhub.html#roles', link: 'شاهد تصفية المواقع' },
  },
  matching: {
    en: { text: 'There is no personalized recommendation engine yet. Search published roles when the live API is configured, or explore the clearly marked sample roles in preview mode.', href: './careerhub.html#roles', link: 'Search available roles' },
    ar: { text: 'لا يوجد محرك توصيات مخصص حتى الآن. ابحث في الوظائف المنشورة عند إعداد الـAPI المباشر، أو استكشف الوظائف التجريبية الموضحة في وضع المعاينة.', href: './careerhub.html#roles', link: 'ابحث في الوظائف المتاحة' },
  },
  profile: {
    en: { text: 'A profile editor and CV upload are not connected to this preview. The Career Toolkit includes a private STAR story draft saved in this browser, plus a short job-search checklist.', href: './resources.html#story-lab', link: 'Open the Career Toolkit' },
    ar: { text: 'تعديل الملف الشخصي ورفع السيرة الذاتية غير متصلين بهذه المعاينة. «أدوات المسار المهني» فيها مسودة قصة مقابلة بطريقة STAR وقائمة بحث قصيرة، محفوظتان في المتصفح.', href: './resources.html#story-lab', link: 'افتح أدوات المسار المهني' },
  },
  start: {
    en: { text: 'Start by searching CareerHub roles, save a shortlist, and use the seven-day Launchpad plan. If you are in preview mode, the sample listings and local planning tools still work without an account.', href: './careerhub.html#roles', link: 'Start exploring' },
    ar: { text: 'ابدأ بالبحث في وظائف CareerHub واحفظ قائمة مختصرة، ثم استخدم خطة Launchpad لسبعة أيام. في وضع المعاينة، تعمل الوظائف التجريبية وأدوات التخطيط المحلية دون حساب.', href: './careerhub.html#roles', link: 'ابدأ الاستكشاف' },
  },
  fallback: {
    en: { text: 'I can explain published job search, saved roles, applications, the seven-day Launchpad, the Toolkit, and both account and local tracking. I will say when a feature is unavailable in the current configuration.' },
    ar: { text: 'أستطيع شرح البحث في الوظائف المنشورة وحفظها والتقديم وخطة Launchpad لسبعة أيام والأدوات والمتابعة المحلية ومتابعة الحساب. سأوضح لك ما لا يتوفر في الإعداد الحالي.' },
  },
};

function topicFor(question) {
  const q = question.trim().toLocaleLowerCase();
  if (/career\s*locator|locator|geolocation|محدد|تحديد الموقع|موقع الوظائف/.test(q)) return 'locator';
  if (/apply|application|submit|التقديم|أقدم|قدم على|طلب توظيف/.test(q)) return 'apply';
  if (/track|tracker|status|متابعة|حالة الطلب|طلبات/.test(q)) return 'tracking';
  if (/match|recommend|skills|مهارات|يناسب|تناسب|ترشيح/.test(q)) return 'matching';
  if (/profile|resume|\bcv\b|سيرة|الملف الشخصي|ملفي/.test(q)) return 'profile';
  if (/search|find a job|find jobs|job|وظيف|ابحث|أبحث|أدور|فرص/.test(q)) return 'search';
  if (/start|get started|begin|أبدأ|ابدأ|أبدأ منين|البداية/.test(q)) return 'start';
  return 'fallback';
}

export class LocalCareerGuideProvider {
  answer(question, language = 'en') {
    return content[topicFor(question)][language === 'ar' ? 'ar' : 'en'];
  }
}
