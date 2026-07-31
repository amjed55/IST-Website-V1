'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { links, primaryNav, site, type NavItem } from '@/lib/content';
import { Button } from './ui';
import { IconDonate, IconPrayer, navIcons } from './icons';

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M2 3.5L5 6.5L8 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isActive(pathname: string, item: NavItem) {
  if (item.href === '/') return pathname === '/';
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  if (item.children?.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))) {
    return true;
  }
  return false;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const menuId = useId();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8));

  useEffect(() => {
    setOpen(false);
    setDrop(null);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setDrop(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ${
        scrolled
          ? 'border-b border-ist-green/10 bg-white/90 shadow-[0_8px_30px_rgba(11,61,54,0.08)] backdrop-blur-xl'
          : 'border-b border-transparent bg-ist-cream/80 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:h-[4.5rem] sm:gap-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <Image
            src="/brand/ist-logo.png"
            alt={site.name}
            width={140}
            height={140}
            priority
            className="h-12 w-auto object-contain transition duration-300 hover:scale-[1.03] sm:h-[3.25rem]"
          />
        </Link>

        {/* Desktop nav — middle column always present so CTAs stay right */}
        <div className="min-w-0">
          <nav
            className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex"
            aria-label="Primary"
            onMouseLeave={() => setDrop(null)}
          >
          {primaryNav.map((item) => {
            const active = isActive(pathname, item);
            const isOpen = drop === item.label;
            const NavIcon = navIcons[item.label];
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setDrop(item.label)}
                onFocusCapture={() => setDrop(item.label)}
              >
                <Link
                  href={item.href}
                  className={`group relative inline-flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-medium tracking-wide transition ${
                    active || isOpen ? 'text-ist-green' : 'text-ist-ink/70 hover:text-ist-green'
                  }`}
                  aria-expanded={item.children ? isOpen : undefined}
                  aria-haspopup={item.children ? 'menu' : undefined}
                >
                  {NavIcon && (
                    <span className="opacity-70 transition group-hover:opacity-100">
                      <NavIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {item.label}
                  {item.children && <Chevron open={isOpen} />}
                  <span
                    className={`absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-ist-teal transition-transform duration-300 ${
                      active || isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {item.children && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
                      role="menu"
                    >
                      <div className="w-[240px] overflow-hidden rounded-2xl border border-ist-green/10 bg-white p-1.5 shadow-[0_20px_50px_rgba(11,61,54,0.14)]">
                        {item.children.map((child) => {
                          const childActive =
                            pathname === child.href || pathname.startsWith(`${child.href}/`);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              role="menuitem"
                              className={`block rounded-xl px-3.5 py-2.5 text-sm transition ${
                                childActive
                                  ? 'bg-ist-cream text-ist-green font-medium'
                                  : 'text-ist-ink/75 hover:bg-ist-cream hover:text-ist-green'
                              }`}
                              onClick={() => setDrop(null)}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          </nav>
        </div>

        {/* Right actions — CTAs desktop / menu mobile */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/prayer-times"
              className="inline-flex items-center gap-2 rounded-full bg-ist-teal px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ist-teal-light"
            >
              <IconPrayer className="h-3.5 w-3.5" />
              Prayer Times
            </Link>
            <a
              href={links.donate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-ist-green px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ist-green-deep"
            >
              <IconDonate className="h-3.5 w-3.5" />
              Donate
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ist-green/12 bg-white text-ist-green shadow-sm"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3.5 w-4" aria-hidden>
                <span
                  className={`absolute left-0 block h-0.5 w-full rounded bg-current transition ${
                    open ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-full rounded bg-current transition ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-full rounded bg-current transition ${
                    open ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-ist-green-deep/45 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute right-0 top-0 flex h-full w-[min(94vw,400px)] flex-col bg-white shadow-lift"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
            >
              <div className="flex items-center justify-between border-b border-ist-green/8 px-5 py-4">
                <Image
                  src="/brand/ist-logo.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-12 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-ist-cream px-3.5 py-2 text-sm font-medium text-ist-green"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {primaryNav.map((item, i) => {
                  const expanded = mobileExpand === item.label;
                  const active = isActive(pathname, item);
                  const NavIcon = navIcons[item.label];
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-ist-green/6"
                    >
                      <div className="flex items-center gap-1">
                        <Link
                          href={item.href}
                          className={`flex flex-1 items-center gap-2.5 px-3 py-3.5 text-[15px] font-semibold ${
                            active ? 'text-ist-teal' : 'text-ist-green'
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {NavIcon && (
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ist-cream text-ist-green">
                              <NavIcon className="h-4 w-4" />
                            </span>
                          )}
                          {item.label}
                        </Link>
                        {item.children && (
                          <button
                            type="button"
                            className="mr-1 rounded-lg p-2.5 text-ist-muted"
                            aria-expanded={expanded}
                            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`}
                            onClick={() =>
                              setMobileExpand((v) => (v === item.label ? null : item.label))
                            }
                          >
                            <Chevron open={expanded} />
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {item.children && expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-0.5 pb-3 pl-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="rounded-xl px-3 py-2.5 text-sm text-ist-muted transition hover:bg-ist-cream hover:text-ist-green"
                                  onClick={() => setOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid gap-2 border-t border-ist-green/8 p-4">
                <Button href="/prayer-times" variant="teal" className="w-full">
                  Prayer Times
                </Button>
                <Button href={links.donate} variant="primary" external className="w-full">
                  Donate
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
