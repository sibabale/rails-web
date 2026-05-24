import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
export const BYOD_JOURNEY_BUG_LOG = path.join(LOG_DIR, 'byod-journey-bugs.jsonl');
export const BYOD_JOURNEY_LIVE_BUG_LOG = path.join(LOG_DIR, 'byod-journey-live-bugs.jsonl');

export type JourneyBugEntry = {
  timestamp: string;
  step: string;
  message: string;
  detail?: string;
};

export function clearJourneyBugLogAt(logPath: string): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(logPath, '');
}

export function clearJourneyBugLog(): void {
  clearJourneyBugLogAt(BYOD_JOURNEY_BUG_LOG);
}

export function logJourneyBugAt(logPath: string, step: string, message: string, detail?: string): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const entry: JourneyBugEntry = {
    timestamp: new Date().toISOString(),
    step,
    message,
    ...(detail ? { detail } : {}),
  };
  fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`);
  const tag = logPath.includes('live') ? 'LIVE-JOURNEY-BUG' : 'BYOD-JOURNEY-BUG';
  console.warn(`[${tag}] ${step}: ${message}${detail ? ` — ${detail}` : ''}`);
}

export function logJourneyBug(step: string, message: string, detail?: string): void {
  logJourneyBugAt(BYOD_JOURNEY_BUG_LOG, step, message, detail);
}

/** Run an expectation; log and continue on failure (does not fail the test). */
export async function expectOrLogAt(
  logPath: string,
  step: string,
  assertion: () => Promise<void>,
): Promise<boolean> {
  try {
    await assertion();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const detail =
      error instanceof Error && error.stack ? error.stack.split('\n').slice(1, 4).join('\n') : undefined;
    logJourneyBugAt(logPath, step, message, detail);
    return false;
  }
}

export function expectOrLog(step: string, assertion: () => Promise<void>): Promise<boolean> {
  return expectOrLogAt(BYOD_JOURNEY_BUG_LOG, step, assertion);
}
