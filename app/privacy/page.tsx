import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { Badge, Section } from '@/components/ui';
import { FadeIn, PageTransition } from '@/components/motion';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <PageTransition>
      <Section>
        <FadeIn>
          <Badge>Privacy</Badge>
          <h1 className="mt-3 font-display text-5xl text-ist-green">Privacy notice</h1>
          <p className="mt-3 max-w-2xl text-ist-muted">
            Short explanation of how IST handles information submitted through this website.
          </p>
        </FadeIn>

        <FadeIn className="prose prose-ist mt-10 max-w-3xl space-y-6 text-ist-muted">
          <div>
            <h2 className="font-display text-2xl text-ist-green">What we collect</h2>
            <p className="mt-2">
              Contact and inquiry forms may collect your name, email, phone number, message, program
              or event interest. Career applications may also include a LinkedIn URL and an uploaded
              resume (PDF/Word) or resume link. All forms use Cloudflare Turnstile captcha.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ist-green">Why we collect it</h2>
            <p className="mt-2">
              So IST staff can respond to questions, registration interest, volunteer offers, event
              inquiries, and job applications.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ist-green">Who receives it</h2>
            <p className="mt-2">
              Form submissions are emailed to <strong>{site.formTo}</strong> and handled by IST
              staff. We do not sell personal data.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ist-green">Retention & requests</h2>
            <p className="mt-2">
              Messages are retained as needed to handle your request. To ask about access or removal,
              email{' '}
              <a className="text-ist-teal underline" href={`mailto:${site.formTo}`}>
                {site.formTo}
              </a>{' '}
              or{' '}
              <a className="text-ist-teal underline" href={site.emailHref}>
                {site.email}
              </a>
              .
            </p>
          </div>
        </FadeIn>
      </Section>
    </PageTransition>
  );
}
