export type GuideLanguage = 'en' | 'ar';
export type GuideReply = { text: string; href?: string; link?: string };
export class LocalCareerGuideProvider {
  answer(question: string, language?: GuideLanguage): GuideReply;
}
