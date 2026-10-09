import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalCareerGuideProvider } from '../src/core/careerGuideEngine.mjs';
import { csvCell } from '../src/core/csv.mjs';
import { normalizeSearchTerm } from '../src/core/searchNormalization.mjs';

const guide = new LocalCareerGuideProvider();

test('career guide distinguishes the unavailable Career Locator', () => {
  const reply = guide.answer('Is Career Locator available?', 'en');
  assert.match(reply.text, /not available/i);
  assert.equal(reply.href, './careerhub.html#roles');
});

test('career guide answers in Arabic and distinguishes demo roles from live applications', () => {
  const reply = guide.answer('إزاي أقدم على وظيفة؟', 'ar');
  assert.match(reply.text, /الوظائف التجريبية لا تستقبل طلبات/);
  assert.match(reply.text, /API/);
});

test('career guide fallback explains current configuration without claiming AI', () => {
  const reply = guide.answer('Can you guarantee success?', 'en');
  assert.match(reply.text, /current configuration/);
  assert.doesNotMatch(reply.text, /AI-powered/i);
});

test('CSV cells quote fields and escape embedded quotes', () => {
  assert.equal(csvCell('North "Star", Inc.'), '"North ""Star"", Inc."');
});

test('CSV cells neutralize spreadsheet formula prefixes', () => {
  assert.equal(csvCell('=HYPERLINK("https://example.com")'), "\"'=HYPERLINK(\"\"https://example.com\"\")\"");
  assert.equal(csvCell('  +SUM(A1:A2)'), '"\'  +SUM(A1:A2)"');
});

test('empty Arabic search terms stay empty instead of matching the first translation', () => {
  const translations = new Map([['فرص تجريبية', 'sample opportunities'], ['الهندسة', 'Engineering']]);
  assert.equal(normalizeSearchTerm('', 'ar', translations), '');
  assert.equal(normalizeSearchTerm('   ', 'ar', translations), '');
  assert.equal(normalizeSearchTerm('الهندسة', 'ar', translations), 'engineering');
});
