
export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  code: string;
}

export enum ApplicationStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
