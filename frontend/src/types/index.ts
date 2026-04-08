export type FieldType = 'text' | 'image';

export interface PromptPayload {
  category?: string; // e.g. marketing, coding, design
  modelMode?: 'fast' | 'pro';
  role: string;
  context: string;
  task: string;
  fieldType: FieldType;
  // Dynamic fields
  tone?: string; // If fieldType is 'text'
  lighting?: string; // If fieldType is 'image'
}

export interface DiffLabel {
  phrase: string;
  label: string;
}

export interface PromptResponse {
  success: boolean;
  versionA: string; // the old version sent
  versionB: string; // the newly generated raw text
  diffHtml: string; // the html string with highlight spans
  labels?: DiffLabel[];
  error?: string;
}
