'use client';

import { useState } from 'react';
import MaterialIcon from '@/components/atoms/MaterialIcon/MaterialIcon';

interface ConnectionStringFieldProps {
  name: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onCopy: (value: string) => void;
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
          onClick={() => onCopy(value)}
          disabled={!value}
          aria-label={`Copy ${ariaLabel}`}
          className="pointer-events-auto text-zinc-400 transition-colors hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-300"
        >
          <MaterialIcon name="content_copy" />
        </button>
      </div>
    </div>
  );
}
