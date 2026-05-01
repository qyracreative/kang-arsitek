export type ProductionStatus = 'Draft' | 'Ready' | 'Generated' | 'Edited' | 'Uploaded';
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed' | 'unconfigured';

export interface ScenePrompt {
  id: number;
  title: string;
  visualPrompt: string;
  cameraEffect: string;
  soundEffect: string;
  dialog: string;
  content?: string; // For legacy support/sheet sync
}

export interface PromptState {
  character: string;
  location: string;
  building: string;
  weather: string;
  theme: string;
  status: ProductionStatus;
}

export interface Project extends PromptState {
  id: string;
  title: string;
  prompts: ScenePrompt[];
  createdAt: number;
}
