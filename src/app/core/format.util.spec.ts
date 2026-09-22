import { addDays, fmt, isEmail, parseEmails } from './format.util';

describe('format.util', () => {
  it('fmt formats a date in es-CO long form', () => {
    expect(fmt('2026-09-22')).toContain('2026');
    expect(fmt(null)).toBe('—');
  });

  it('addDays advances a date by N days', () => {
    expect(addDays('2026-09-22', 10)).toBe('2026-10-02');
  });

  it('isEmail validates basic email shape', () => {
    expect(isEmail('a@b.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
  });

  it('parseEmails splits on commas/whitespace/semicolons', () => {
    expect(parseEmails('a@b.com, c@d.com; e@f.com')).toEqual(['a@b.com', 'c@d.com', 'e@f.com']);
  });
});
