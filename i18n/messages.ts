import type { AppLocale } from './routing';

export async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case 'ar':
      return (await import('@/messages/ar.json')).default;
    case 'ur':
      return (await import('@/messages/ur.json')).default;
    case 'ps':
      return (await import('@/messages/ps.json')).default;
    case 'fa-AF':
      return (await import('@/messages/fa-AF.json')).default;
    case 'fr':
      return (await import('@/messages/fr.json')).default;
    default:
      return (await import('@/messages/en.json')).default;
  }
}
