/** Public GitHub repository root for SDK sample folders (no trailing slash). */
const DEFAULT_SAMPLES_REPO_URL = 'https://github.com/railsinfra/rails-sdk-samples';

export const SDK_SAMPLE_FOLDERS = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'java', label: 'Java' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'csharp', label: 'C#' },
] as const;

export function getSamplesRepoBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SAMPLES_REPO_URL?.trim();
  const base = raw || DEFAULT_SAMPLES_REPO_URL;
  return base.replace(/\/$/, '');
}

/** Link to a sample folder on GitHub (default branch main). */
export function samplesFolderUrl(folder: string, branch = 'main', baseOverride?: string): string {
  const base = (baseOverride ?? getSamplesRepoBaseUrl()).replace(/\/$/, '');
  const path = folder.replace(/^\/+|\/+$/g, '');
  return `${base}/tree/${branch}/${path}`;
}
