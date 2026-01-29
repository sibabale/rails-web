
export interface NavItem {
  label: string;
  href: string;
}

export interface CodeSnippets {
  ts: string;
  go: string;
  java: string;
  python: string;
  kotlin: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  snippets: CodeSnippets;
  bullets: string[];
}

export enum ApplicationStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
