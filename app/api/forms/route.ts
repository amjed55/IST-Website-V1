import { NextRequest, NextResponse } from 'next/server';
import { getTurnstileSecretKey } from '@/lib/turnstile';

export const runtime = 'nodejs';

const rateMap = new Map<string, { count: number; reset: number }>();

const ALLOWED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 5;
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

function clean(value: unknown, max = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = getTurnstileSecretKey();
  if (!secret) return null;
  if (!token) return false;
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const verified = await verify.json();
  return Boolean(verified.success);
}

async function parseBody(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    const data: Record<string, unknown> = {};
    let resumeFile: File | null = null;
    for (const [key, value] of fd.entries()) {
      if (key === 'resumeFile' && value instanceof File) {
        resumeFile = value;
      } else if (typeof value === 'string') {
        data[key] = value;
      }
    }
    return { data, resumeFile };
  }
  const data = await req.json();
  return { data: data as Record<string, unknown>, resumeFile: null as File | null };
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { data: body, resumeFile } = await parseBody(req);

    if (clean(body.website)) {
      return NextResponse.json({ ok: true });
    }

    const type = clean(body.type, 40) || 'contact';
    const name = clean(body.name, 120);
    const email = clean(body.email, 160);
    const message = clean(body.message, 4000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
    }

    const token = clean(body.turnstileToken, 2048);
    const captchaOk = await verifyTurnstile(token, ip);
    if (captchaOk === null) {
      return NextResponse.json(
        { error: 'This form is temporarily unavailable.' },
        { status: 503 },
      );
    }
    if (!captchaOk) {
      return NextResponse.json({ error: 'Captcha failed. Please try again.' }, { status: 400 });
    }

    let attachment:
      | { filename: string; content: Buffer; contentType?: string }
      | undefined;

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > MAX_RESUME_BYTES) {
        return NextResponse.json({ error: 'Resume must be 5MB or smaller.' }, { status: 400 });
      }
      const contentType = resumeFile.type || 'application/octet-stream';
      const nameLower = resumeFile.name.toLowerCase();
      const okExt =
        nameLower.endsWith('.pdf') || nameLower.endsWith('.doc') || nameLower.endsWith('.docx');
      if (!ALLOWED_RESUME_TYPES.has(contentType) && !okExt) {
        return NextResponse.json(
          { error: 'Resume must be a PDF or Word document.' },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      attachment = {
        filename: resumeFile.name.replace(/[^\w.\- ()]/g, '_').slice(0, 120) || 'resume.pdf',
        content: buffer,
        contentType,
      };
    }

    const to =
      type === 'career-apply'
        ? process.env.CAREERS_TO_EMAIL || process.env.FORM_TO_EMAIL || 'jobs@myist.org'
        : process.env.FORM_TO_EMAIL || 'mamjed@myist.org';

    const fields = {
      type,
      name,
      email,
      phone: clean(body.phone, 40),
      topic: clean(body.topic, 80),
      program: clean(body.program, 120),
      event: clean(body.event, 160),
      interests: clean(body.interests, 200),
      availability: clean(body.availability, 200),
      jobId: clean(body.jobId, 80),
      role: clean(body.role, 160),
      linkedin: clean(body.linkedin, 300),
      resume: clean(body.resume, 400),
      resumeFile: attachment ? attachment.filename : '',
      applySubject: clean(body.applySubject, 200),
      message,
      ip,
    };

    const subject =
      type === 'career-apply' && fields.applySubject
        ? fields.applySubject
        : `[IST ${type}] ${fields.topic || fields.program || fields.event || fields.role || name}`;

    const text = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v || '—'}`)
      .join('\n');

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const from = process.env.RESEND_FROM_EMAIL;
      if (!from && process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Email delivery is not configured.' },
          { status: 503 },
        );
      }
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: from || 'IST Website <onboarding@resend.dev>',
        to: [to],
        replyTo: email,
        subject,
        text,
        attachments: attachment
          ? [
              {
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
              },
            ]
          : undefined,
      });
      if (result.error) {
        console.error(result.error);
        return NextResponse.json({ error: 'Email provider error.' }, { status: 502 });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('[IST form]', {
        to,
        subject,
        text,
        attachment: attachment?.filename,
      });
    } else {
      return NextResponse.json(
        { error: 'Email delivery is not configured.' },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unable to send right now.' }, { status: 500 });
  }
}
