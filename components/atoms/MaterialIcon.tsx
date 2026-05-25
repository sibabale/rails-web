'use client';

interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function MaterialIcon({ name, size = 18, className = '' }: MaterialIconProps) {
  return (
    <span
      aria-hidden
      className={`material-symbols-sharp leading-none ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
}
