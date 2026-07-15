'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { ease } from './motion';

/**
 * Wraps every page (via app/template.tsx).
 * Re-keyed on each pathname → Framer Motion replays initial→animate on every nav.
 * No AnimatePresence needed here — template.tsx remounts fully on route change.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
