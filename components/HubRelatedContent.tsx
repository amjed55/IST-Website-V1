import Link from 'next/link';
import type { DbEvent, DbProgram } from '@/lib/db';
import { Badge } from '@/components/ui';
import { FadeUp, Stagger, StaggerItem } from '@/components/motion';

function mapEvent(e: DbEvent) {
  return {
    id: e.id,
    title: e.title,
    dateLabel: e.date_label,
    summary: e.summary,
    badge: e.badge,
    location: e.location,
    status: e.status,
    recurring: Boolean(e.recurring),
  };
}

export function HubRelatedContent({
  hubLabel,
  events,
  programs,
}: {
  hubLabel: string;
  events: DbEvent[];
  programs: DbProgram[];
}) {
  const upcoming = events.filter((e) => e.status === 'upcoming').map(mapEvent);
  const past = events.filter((e) => e.status === 'past').map(mapEvent);

  return (
    <div className="mt-14 space-y-12 border-t border-ist-green/10 pt-12">
      <FadeUp>
        <span className="eyebrow">{hubLabel}</span>
        <h2 className="mt-3 font-display text-3xl text-ist-green sm:text-4xl">
          Programmes &amp; events
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ist-ink/60">
          Everything currently linked to this hub — programmes you can join and events on the calendar.
        </p>
      </FadeUp>

      <section>
        <h3 className="font-display text-2xl text-ist-green">Programmes</h3>
        {programs.length === 0 ? (
          <p className="mt-3 text-sm text-ist-muted">Programmes for this hub will appear here.</p>
        ) : (
          <Stagger staggerDelay={0.06} className="mt-5 grid gap-4 sm:grid-cols-2">
            {programs.map((p) => (
              <StaggerItem key={p.id}>
                <article className="h-full border border-ist-green/10 bg-white p-5 transition hover:border-ist-teal/40">
                  <div className="flex flex-wrap gap-2">
                    {(p.tags_json ? (JSON.parse(p.tags_json) as string[]) : []).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  <h4 className="mt-3 font-display text-xl text-ist-green">{p.title}</h4>
                  {p.schedule && (
                    <p className="mt-1 text-xs font-semibold text-ist-teal">{p.schedule}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">{p.summary}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-display text-2xl text-ist-green">Upcoming events</h3>
          <Link href="/events" className="text-sm font-semibold text-ist-teal hover:underline">
            All events →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ist-muted">No upcoming hub events right now.</p>
        ) : (
          <Stagger staggerDelay={0.06} className="mt-5 divide-y divide-ist-green/8 border-y border-ist-green/8">
            {upcoming.map((e) => (
              <StaggerItem key={e.id}>
                <article className="py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.badge && <Badge>{e.badge}</Badge>}
                    {e.recurring && (
                      <Badge className="bg-ist-gold/20 text-ist-green">Recurring</Badge>
                    )}
                  </div>
                  <h4 className="mt-2 font-display text-xl text-ist-green">{e.title}</h4>
                  <p className="mt-1 text-sm font-medium text-ist-teal">{e.dateLabel}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">{e.summary}</p>
                  {e.location && <p className="mt-2 text-xs text-ist-muted">{e.location}</p>}
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="font-display text-2xl text-ist-green">Past events</h3>
          <ul className="mt-4 space-y-3 opacity-60">
            {past.map((e) => (
              <li key={e.id} className="border-l-2 border-ist-green/15 pl-4">
                <p className="font-medium text-ist-green">{e.title}</p>
                <p className="text-xs text-ist-muted">{e.dateLabel}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
