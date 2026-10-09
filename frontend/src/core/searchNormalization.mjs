export function normalizeSearchTerm(value, locale, translatedTerms) {
  const normalized = value.trim().toLocaleLowerCase(locale === 'ar' ? 'ar-EG' : 'en');
  if (!normalized || locale !== 'ar') return normalized;

  const exact = translatedTerms.get(normalized);
  if (exact) return exact.toLocaleLowerCase('en');
  const partial = [...translatedTerms.entries()].find(([translated]) => translated.includes(normalized));
  return partial ? partial[1].toLocaleLowerCase('en') : normalized;
}
