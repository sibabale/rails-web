import React from 'react';

type RailsTrackMarkProps = {
  className?: string;
};

/** Two rails with three ties—reads as stylized track in a tiny square. */
export function RailsTrackMark({ className = 'h-3 w-3' }: RailsTrackMarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden data-testid="rails-track-mark">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <line x1="6" y1="5" x2="6" y2="19" />
        <line x1="18" y1="5" x2="18" y2="19" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="6" y1="16" x2="18" y2="16" />
      </g>
    </svg>
  );
}
