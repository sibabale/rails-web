import React from 'react';

export type CodeScrollPaneProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Fixed viewport height (Tailwind height class). */
  heightClass?: string;
};

/**
 * Fixed-height pane for code samples: scrolls overflow on both axes with scrollbars hidden
 * (uses `.no-scrollbar` from theme.css).
 */
export function CodeScrollPane({
  heightClass = 'h-[280px]',
  className = '',
  children,
  ...props
}: CodeScrollPaneProps) {
  return (
    <div className={`no-scrollbar overflow-auto ${heightClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
