'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion';

export const ease = [0.21, 0.47, 0.32, 0.98] as const;

const revealViewport = { once: true, amount: 0.12, margin: '0px 0px -8% 0px' } as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  id?: string;
  /** When true, animate on mount instead of waiting for scroll (above-the-fold) */
  immediate?: boolean;
};

/** Shared fade-up used for scroll and load reveals */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.65,
  className = '',
  y = 36,
  id,
  immediate = false,
}: RevealProps) {
  const reduce = useReducedMotion();
  const hidden = {
    opacity: 0,
    y: reduce ? 0 : y,
  };
  const visible = {
    opacity: 1,
    y: 0,
  };

  return (
    <motion.div
      id={id}
      className={className}
      initial={hidden}
      {...(immediate
        ? { animate: visible }
        : { whileInView: visible, viewport: revealViewport })}
      transition={{
        duration: reduce ? 0 : duration,
        delay: reduce ? 0 : delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export const FadeIn = FadeUp;

/** Section-level reveal (renders as <section>) */
export function RevealSection({
  children,
  className = '',
  delay = 0,
  id,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{
        duration: reduce ? 0 : 0.7,
        delay: reduce ? 0 : delay,
        ease,
      }}
    >
      {children}
    </motion.section>
  );
}

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
      transition: { staggerChildren: reduce ? 0 : staggerDelay, delayChildren: reduce ? 0 : 0.05 },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
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
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease },
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
  const x = from === 'left' ? -48 : 48;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: reduce ? 0 : x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={revealViewport}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease }}
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
      initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={revealViewport}
      transition={{ duration: reduce ? 0 : 0.65, delay: reduce ? 0 : delay, ease }}
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
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setCount(value);
      return;
    }
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
      {prefix}
      {value >= 1000 ? count.toLocaleString() : count}
      {suffix}
    </span>
  );
}

/**
 * Wraps each top-level page block so it fades in on load (if in view)
 * and as the user scrolls further down the page.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const blocks = Children.toArray(children);

  return (
    <>
      {blocks.map((child, i) => {
        const key =
          isValidElement(child) && child.key != null ? String(child.key) : `block-${i}`;
        const props: HTMLMotionProps<'div'> = {
          initial: { opacity: 0, y: reduce ? 0 : 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: revealViewport,
          transition: {
            duration: reduce ? 0 : 0.7,
            // Stagger only the first few in-view blocks on load; later blocks fade as they enter
            delay: reduce ? 0 : (i < 4 ? i * 0.09 : 0),
            ease,
          },
        };
        return (
          <motion.div key={key} {...props}>
            {child}
          </motion.div>
        );
      })}
    </>
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
export function ParallaxImage({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  if (reduce)
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="h-full w-full scale-[1.08] will-change-transform" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

export function MotionSection({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <FadeUp id={id} className={className}>
      {children}
    </FadeUp>
  );
}
