import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { images } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, SlideInLeft, SlideInRight } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { QrConnectStrip } from '@/components/QrConnectStrip';
import { PageHero } from '@/components/PageHero';
import { InstagramFeed } from '@/components/InstagramFeed';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact the Islamic Society of Toronto office about education, Nikah, Janazah, volunteering, events, or a first visit.',
};

type Props = { searchParams: Promise<{ topic?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { topic } = await searchParams;
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.visit}
        eyebrow="Contact us"
        title="Get in touch"
        description="Contact the IST office for programme registrations, nikah enquiries, volunteering, or any general questions."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left — office info */}
          <SlideInLeft>
            <div className="h-full space-y-6">
              <div>
                <span className="eyebrow">Office</span>
                <h2 className="mt-4 font-display text-3xl text-ist-green">Get in touch</h2>
              </div>

              <div className="space-y-1 text-ist-ink/70">
                <p className="font-medium text-ist-ink">{site.address}</p>
                <p>
                  <a href={site.phoneHref} className="text-link">{site.phone}</a>
                </p>
                <p>
                  <a href={site.emailHref} className="text-link">{site.email}</a>
                </p>
              </div>

              <div className="border-l-2 border-ist-teal/30 pl-4 text-sm text-ist-ink/65">
                <p className="font-semibold text-ist-green">Office hours</p>
                <p className="mt-2">
                  Office availability changes around prayers and programmes. Please call or email
                  ahead so staff can confirm a suitable time before you travel.
                </p>
              </div>

              <div className="border-l-2 border-ist-teal/30 pl-4 text-sm text-ist-ink/65">
                <p className="font-semibold text-ist-green">Programme hours (quick reference)</p>
                <p className="mt-2">Sunday Madrasah: 10:30 AM – 2:00 PM</p>
                <p>Evening Madressa: Mon–Fri 5:15 – 7:15 PM</p>
                <p>Part-time Alim &amp; Hifz: Mon–Fri 4:40 – 7:30 PM</p>
              </div>

              <Button href="/visit" variant="teal">
                Directions &amp; parking
              </Button>

              <div className="overflow-hidden border border-ist-green/8">
                <iframe
                  title="Map"
                  src={site.mapEmbed}
                  className="h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </SlideInLeft>

          {/* Right — form */}
          <SlideInRight delay={0.1}>
            <div className="h-full">
              <span className="eyebrow">Message</span>
              <h2 className="mt-4 font-display text-3xl text-ist-green">Send a message</h2>
              <div className="mt-6">
                <SiteForm type="contact" prefill={{ topic: topic || 'General' }} />
              </div>
            </div>
          </SlideInRight>
        </div>

        <FadeUp delay={0.1} className="mt-16 border-t border-ist-green/8 pt-16">
          <QrConnectStrip title="Prefer WhatsApp or Instagram?" />
        </FadeUp>
      </Section>

      <Section id="social" className="section-band !pt-0">
        <InstagramFeed />
      </Section>
    </PageTransition>
  );
}
