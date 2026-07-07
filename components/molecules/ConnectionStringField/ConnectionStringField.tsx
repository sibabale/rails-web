'use client';

import { useEffect, useRef, useState } from 'react';
import MaterialIcon from '@/components/atoms/MaterialIcon/MaterialIcon';

interface ConnectionStringFieldProps {
  name: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onCopy: (value: string) => void | Promise<void>;
}

export default function ConnectionStringField({
  name,
  value,
  placeholder,
  ariaLabel,
  onChange,
  onCopy,
}: ConnectionStringFieldProps) {
  const [show, setShow] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySucceeded, setCopySucceeded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!value || isCopying) return;

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    setCopySucceeded(false);
    setIsCopying(true);

    try {
      await onCopy(value);
      setCopySucceeded(true);
      
      // Add screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = copyButtonLabel;
      document.body.appendChild(announcement);
      setTimeout(() => announcement.remove(), 100);
      
      resetTimerRef.current = window.setTimeout(() => {
        setCopySucceeded(false);
        resetTimerRef.current = null;
      }, 1200);
    } catch {
      setCopySucceeded(false);
    } finally {
      setIsCopying(false);
    }
  };

  const copyIconName = isCopying ? 'progress_activity' : copySucceeded ? 'check' : 'content_copy';
  const copyButtonLabel = isCopying
    ? `Copying ${ariaLabel}`
    : copySucceeded
      ? `Copied ${ariaLabel}`
      : `Copy ${ariaLabel}`;
  const copyIconClassName = isCopying && !prefersReducedMotion ? 'animate-spin' : '';

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#0a0a0a]">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full border-0 bg-transparent py-2.5 pl-4 pr-[4.75rem] font-mono text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:ring-0 dark:text-white dark:placeholder:text-zinc-600"
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? `Hide ${ariaLabel}` : `Show ${ariaLabel}`}
          className="pointer-events-auto text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <MaterialIcon name={show ? 'visibility_off' : 'visibility'} />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value || isCopying}
          aria-label={copyButtonLabel}
          data-testid="connection-string-copy"
          className={`pointer-events-auto transition-all ${
            copySucceeded
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-300'
          }`}
          title={copyButtonLabel}
        >
          <MaterialIcon name={copyIconName} className={copyIconClassName} />
        </button>
      </div>
    </div>
  );
}
