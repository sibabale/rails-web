import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page, Response } from '@playwright/test';

const LOG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artifacts');
export const LIVE_JOURNEY_TIMELINE_LOG = path.join(LOG_DIR, 'byod-journey-live-timeline.jsonl');

export type TimelineEntry = {
  ts: string;
  elapsed_ms: number;
  layer: 'e2e' | 'api';
  event: string;
  detail?: string;
  method?: string;
  url?: string;
  status?: number;
  body?: unknown;
};

let runStartedAt = 0;

export function startLiveTimeline(): void {
  runStartedAt = Date.now();
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(LIVE_JOURNEY_TIMELINE_LOG, '');
  appendTimeline({ layer: 'e2e', event: 'run_start' });
}

function appendTimeline(partial: Omit<TimelineEntry, 'ts' | 'elapsed_ms'>) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const entry: TimelineEntry = {
    ts: new Date().toISOString(),
    elapsed_ms: runStartedAt ? Date.now() - runStartedAt : 0,
    ...partial,
  };
  fs.appendFileSync(LIVE_JOURNEY_TIMELINE_LOG, `${JSON.stringify(entry)}\n`);
}

export function logTimelineStep(event: string, detail?: string): void {
  appendTimeline({ layer: 'e2e', event, detail });
  console.log(`[live-timeline +${Date.now() - runStartedAt}ms] ${event}${detail ? `: ${detail}` : ''}`);
}

export function attachApiTimeline(page: Page, apiOrigin: string): void {
  page.on('response', async (response: Response) => {
    const url = response.url();
    if (!url.includes('/api/v1/database-connections')) return;
    if (!url.startsWith(apiOrigin) && !url.includes('127.0.0.1:3100')) return;

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    appendTimeline({
      layer: 'api',
      event: 'database_connections_response',
      method: response.request().method(),
      url,
      status: response.status(),
      body,
    });
  });
}
