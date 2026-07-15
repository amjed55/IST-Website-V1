'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';
import { getTurnstileSiteKey } from '@/lib/turnstile';

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  className?: string;
};

export function TurnstileField({ onToken, onExpire, className = '' }: Props) {
  const ref = useRef<TurnstileInstance | null>(null);
  const siteKey = getTurnstileSiteKey();

  return (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.();
          onToken('');
        }}
        onError={() => onToken('')}
        options={{ theme: 'light', size: 'normal' }}
      />
      <p className="mt-1.5 text-xs text-ist-muted">Protected by Cloudflare Turnstile.</p>
    </div>
  );
}
