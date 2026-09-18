import test from 'node:test';
import assert from 'node:assert/strict';
import en from '../messages/en.json';
import ar from '../messages/ar.json';
import ur from '../messages/ur.json';
import ps from '../messages/ps.json';
import dari from '../messages/fa-AF.json';
import fr from '../messages/fr.json';

function paths(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

test('all public locales provide the same translation keys', () => {
  const expected = paths(en).sort();
  for (const [locale, messages] of Object.entries({ ar, ur, ps, 'fa-AF': dari, fr })) {
    assert.deepEqual(paths(messages).sort(), expected, `${locale} messages differ from English`);
  }
});
