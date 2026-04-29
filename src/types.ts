export type ProductionStatus = 'Draft' | 'Ready' | 'Generated' | 'Edited' | 'Uploaded';

export interface ScenePrompt {
  id: number;
  title: string;
  content: string;
}

export interface PromptState {
  character: string;
  location: string;
  building: string;
  weather: string;
  theme: string;
  status: ProductionStatus;
}
