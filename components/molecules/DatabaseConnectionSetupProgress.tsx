'use client';

import {
  DATABASE_SETUP_STEPS,
  type DatabaseSetupPhase,
  type SetupProgressOutcome,
  setupPhaseIndex,
} from '@/lib/databaseConnectionSetup';

interface DatabaseConnectionSetupProgressProps {
  phase: DatabaseSetupPhase;
  title: string;
  outcome?: SetupProgressOutcome;
  failedPhase?: DatabaseSetupPhase;
}

export default function DatabaseConnectionSetupProgress({
  phase,
  title,
  outcome = 'in_progress',
  failedPhase,
}: DatabaseConnectionSetupProgressProps) {
  const activeIndex = setupPhaseIndex(phase);
  const failedIndex = failedPhase !== undefined ? setupPhaseIndex(failedPhase) : -1;
  const isTerminalFailed = outcome === 'failed' && failedIndex >= 0;
  const isTerminal = isTerminalFailed || outcome === 'succeeded';

  const stateConfig = {
    failed: {
      className: 'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
      ariaHidden: false as const,
      ariaLabel: 'Failed',
      testId: 'setup-step-failed',
      icon: <span className="material-symbols-sharp !text-[14px] leading-none">close</span>,
    },
    complete: {
      className: 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
      ariaHidden: true as const,
      ariaLabel: undefined,
      testId: undefined,
      icon: <span className="material-symbols-sharp !text-[14px] leading-none">check</span>,
    },
    active: {
      className: 'border-zinc-400 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-black dark:text-white',
      ariaHidden: true as const,
      ariaLabel: undefined,
      testId: undefined,
      icon: <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200" />,  
    },
    pending: {
      className: 'border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-600',
      ariaHidden: true as const,
      ariaLabel: undefined,
      testId: undefined,
      icon: null,
    },
  } as const;

  return (
    <div
      className="border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-[#0a0a0a]"
      data-testid="database-connection-setup-progress"
      role="status"
      aria-live="polite"
      aria-busy={isTerminal ? 'false' : 'true'}
    >
      <p className="mb-3 text-xs font-mono font-semibold uppercase tracking-widest text-zinc-500">
        {isTerminalFailed ? `Setup incomplete for ${title}` : `Setting up ${title}`}
      </p>
      <ol className="space-y-3">
        {DATABASE_SETUP_STEPS.map((step, index) => {
          const isFailedStep = isTerminalFailed && index === failedIndex;
          const isComplete = isTerminalFailed ? index < failedIndex : index < activeIndex;
          const isActive = !isTerminalFailed && index === activeIndex;
          let state: keyof typeof stateConfig;

          if (isFailedStep) state = 'failed';
          else if (isComplete) state = 'complete';
          else if (isActive) state = 'active';
          else state = 'pending';

          const { className, ariaHidden, ariaLabel, testId, icon } = stateConfig[state];

          return (
            <li key={step.id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${className}`}
                aria-hidden={ariaHidden}
                aria-label={ariaLabel}
                data-testid={testId}
              >
                {icon ?? index + 1}
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isFailedStep
                      ? 'text-red-800 dark:text-red-200'
                      : isActive
                        ? 'text-black dark:text-white'
                        : isComplete
                          ? 'text-emerald-800 dark:text-emerald-200'
                          : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                >
                  {step.label}
                </p>
                {isActive ? (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                ) : isFailedStep ? (
                  <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-300">
                    This step did not complete successfully.
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
