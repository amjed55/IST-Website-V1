import { SVGProps, type ReactElement } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function base(props: IconProps) {
  const { title, ...rest } = props;
  return { title, rest };
}

export function IconWhatsApp(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function IconDonate(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 11c0 5.65-7 10-7 10z"
      />
    </svg>
  );
}

export function IconPrayer(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V9l8-5 8 5v11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-6h6v6" />
      <circle cx="12" cy="10.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconAudio(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden={!title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 14.5v-5a8 8 0 0116 0v5M4 14.5a2.5 2.5 0 002.5 2.5H8v-6H6.5A2.5 2.5 0 004 13.5v1zM20 14.5a2.5 2.5 0 01-2.5 2.5H16v-6h1.5a2.5 2.5 0 012.5 2.5v1z"
      />
      <path strokeLinecap="round" d="M16 19c-1 .7-2.3 1-4 1" />
    </svg>
  );
}

export function IconAbout(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="8" r="3.25" />
      <path strokeLinecap="round" d="M5.5 19.5a6.5 6.5 0 0113 0" />
    </svg>
  );
}

export function IconEducation(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5L12 4l9 4.5-9 4.5L3 8.5z" />
      <path strokeLinecap="round" d="M6.5 11v5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-5" />
    </svg>
  );
}

export function IconCommunity(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path strokeLinecap="round" d="M4 18.5a5 5 0 0110 0M13 18.5a4 4 0 017 0" />
    </svg>
  );
}

export function IconServices(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 5.5H20l-4.5 3.3 1.7 5.2L12 14.8 6.8 17l1.7-5.2L4 8.5h6.2L12 3z" />
    </svg>
  );
}

export function IconEvents(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3.5V7M16 3.5V7M3.5 10h17" />
    </svg>
  );
}

export function IconVisit(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.5-5.2-6.5-10.2a6.5 6.5 0 1113 0C18.5 15.8 12 21 12 21z" />
      <circle cx="12" cy="10.8" r="2.2" />
    </svg>
  );
}

export function IconInvolve(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a2 2 0 114 0v4M12 11V6a2 2 0 114 0v5M16 11V8a2 2 0 114 0v7a5 5 0 01-5 5H11a5 5 0 01-5-5v-2a2 2 0 114 0" />
    </svg>
  );
}

export function IconContact(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8 5 8-5" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 4l9 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function IconYouth(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="7" r="3" />
      <path strokeLinecap="round" d="M6 20v-1a6 6 0 0112 0v1" />
      <path strokeLinecap="round" d="M4 12h2M18 12h2M7 9l1.5 1.5M17 9l-1.5 1.5" />
    </svg>
  );
}

export function IconSisters(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="8.5" r="2" />
      <path strokeLinecap="round" d="M4 19a5 5 0 0110 0M13.5 19a4 4 0 016.5 0" />
    </svg>
  );
}

export function IconSeniors(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="8" r="3" />
      <path strokeLinecap="round" d="M5 20a7 7 0 0114 0" />
      <path strokeLinecap="round" d="M12 11v3M9.5 14.5h5" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 16.5v-11z" />
      <path strokeLinecap="round" d="M8 7h8M8 11h6" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

export function IconSports(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M5.5 8.5c2.5 1 5 1 8 0M5.5 15.5c2.5-1 5-1 8 0" />
      <path strokeLinecap="round" d="M12 3.5v17" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="9" cy="8" r="2.75" />
      <circle cx="17" cy="9" r="2.25" />
      <path strokeLinecap="round" d="M3.5 19a5.5 5.5 0 0111 0M14 19a4.5 4.5 0 016.5 0" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5l2.2 5.3 5.8.5-4.4 3.7 1.4 5.6L12 15.8 6.9 18.6l1.4-5.6L4 9.3l5.8-.5L12 3.5z" />
    </svg>
  );
}

export function IconBriefcase(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path strokeLinecap="round" d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3.5 12h17" />
    </svg>
  );
}

export function IconHands(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12V7.5a1.5 1.5 0 013 0V12M11 12V6.5a1.5 1.5 0 013 0V12M14 12V8a1.5 1.5 0 013 0v6.5a4.5 4.5 0 01-4.5 4.5H11A4.5 4.5 0 016.5 14v-1A1.5 1.5 0 019 11.5" />
    </svg>
  );
}

export function IconChild(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="7" r="3" />
      <path strokeLinecap="round" d="M7 20v-2a5 5 0 0110 0v2" />
      <path strokeLinecap="round" d="M9 13h6" />
    </svg>
  );
}

export function IconMosque(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V11l8-6 8 6v9" />
      <path strokeLinecap="round" d="M9 20v-5h6v5M12 5V3" />
      <circle cx="12" cy="2.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconRing(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden={!title} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="13" r="6.5" />
      <path strokeLinecap="round" d="M9 7.5l1.5-3h3L15 7.5" />
    </svg>
  );
}

export const navIcons: Record<string, (props: IconProps) => ReactElement> = {
  Home: IconHome,
  About: IconAbout,
  Education: IconEducation,
  Community: IconCommunity,
  Services: IconServices,
  Events: IconEvents,
  Visit: IconVisit,
  Involve: IconInvolve,
  Contact: IconContact,
};

export const connectIcons = {
  donate: IconDonate,
  whatsapp: IconWhatsApp,
  instagram: IconInstagram,
} as const;

export const topicIcons: Record<string, (props: IconProps) => ReactElement> = {
  youth: IconYouth,
  sisters: IconSisters,
  seniors: IconSeniors,
  education: IconEducation,
  community: IconCommunity,
  services: IconServices,
  events: IconEvents,
  visit: IconVisit,
  volunteer: IconHands,
  donate: IconDonate,
  careers: IconBriefcase,
  sports: IconSports,
  children: IconChild,
  adults: IconBook,
  prayer: IconPrayer,
  mosque: IconMosque,
  nikah: IconRing,
  counselling: IconHeart,
  janazah: IconStar,
  weekly: IconUsers,
  story: IconBook,
  leadership: IconUsers,
  facility: IconMosque,
  madressa: IconChild,
  sunday: IconBook,
  hifz: IconBook,
  alim: IconEducation,
  essentials: IconStar,
  clock: IconClock,
};
