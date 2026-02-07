
export interface NavItem {
  label: string;
  href: string;
}

export interface CodeSnippets {
  ts: string;
  go: string;
  java: string;
  kotlin: string;
  csharp: string;
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
