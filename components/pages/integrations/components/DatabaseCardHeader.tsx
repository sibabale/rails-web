'use client';

import ServiceAvatar from '@/components/molecules/ServiceAvatar';
import Pill from '@/components/atoms/Pill/Pill';

interface DatabaseCardHeaderProps {
  title: string;
  description: string;
  icon: string;
  accentClassName: string;
}

export default function DatabaseCardHeader({
  title,
  description,
  icon,
  accentClassName,
}: DatabaseCardHeaderProps) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <ServiceAvatar primaryIcon="database" accentIcon={icon} accentClassName={accentClassName} />
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-semibold text-black dark:text-white">{title}</h3>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <Pill>PostgreSQL</Pill>
    </div>
  );
}
