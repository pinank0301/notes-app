export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type AIActionType = 'summarize' | 'fix_grammar' | 'generate_tags' | 'elaborate' | 'generate_title';

export interface AIResponse {
  success: boolean;
  data?: string | string[];
  error?: string;
}
