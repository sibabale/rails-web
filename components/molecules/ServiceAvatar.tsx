'use client';

import MaterialIcon from '@/components/atoms/MaterialIcon';

interface ServiceAvatarProps {
  primaryIcon: string;
  accentIcon: string;
  accentClassName: string;
  primaryClassName?: string;
  ringClassName?: string;
}

export default function ServiceAvatar({
  primaryIcon,
  accentIcon,
  accentClassName,
  primaryClassName = 'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  ringClassName = 'ring-white dark:ring-[#050505]',
}: ServiceAvatarProps) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <div
        className={`absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border ${primaryClassName}`}
      >
        <MaterialIcon name={primaryIcon} size={16} />
      </div>
      <div
        className={`absolute bottom-0 left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full ring-2 ${ringClassName} ${accentClassName}`}
      >
        <MaterialIcon name={accentIcon} size={16} />
      </div>
    </div>
  );
}
