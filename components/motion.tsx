'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';

export const ease = [0.21, 0.47, 0.32, 0.98] as const;

/** --- FadeUp / FadeIn -------------------------------------------------- */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.7,
  className = '',
  y = 40,
  id,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  y?: number;
  id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y, filter: reduce ? 'none' : 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export const FadeIn = FadeUp;

/** --- Stagger container ------------------------------------------------- */
export function Stagger({
  children,
  className = '',
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : staggerDelay },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/** --- Stagger item ------------------------------------------------------ */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.6, ease },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** --- SlideIn ----------------------------------------------------------- */
export function SlideIn({
  children,
  className = '',
  from = 'left',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: 'left' | 'right';
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const x = from === 'left' ? -60 : 60;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: reduce ? 0 : x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function SlideInLeft(props: { children: ReactNode; className?: string; delay?: number }) {
  return <SlideIn {...props} from="left" />;
}

export function SlideInRight(props: { children: ReactNode; className?: string; delay?: number }) {
  return <SlideIn {...props} from="right" />;
}

/** --- ScaleIn ----------------------------------------------------------- */
export function ScaleIn({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: reduce ? 1 : 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** --- AnimatedCounter --------------------------------------------------- */
export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current || started) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (reduce) { setCount(value); return; }
    let startTime: number | undefined;
    let frame = 0;
    const tick = (ts: number) => {
      if (startTime === undefined) startTime = ts;
      const p = Math.min((ts - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) frame = requestAnimationFrame(tick);
      else setCount(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value >= 1000 ? count.toLocaleString() : count}{suffix}
    </span>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="reveal-on-load"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.65, ease }}
    >
      {children}
    </motion.div>
  );
}

/** --- Scroll progress bar ---------------------------------------------- */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 32, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-ist-teal via-ist-gold to-ist-teal"
      style={{ scaleX }}
    />
  );
}

/** --- Parallax image ---------------------------------------------------- */
export function ParallaxImage({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  if (reduce) return <div ref={ref} className={className}>{children}</div>;
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="h-full w-full scale-[1.08] will-change-transform" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

export function MotionSection({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <FadeUp id={id} className={className}>{children}</FadeUp>;
}
