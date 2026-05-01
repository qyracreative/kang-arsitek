import { ProductionStatus } from './types';

export const CHARACTERS = [];
export const LOCATIONS = [];
export const BUILDINGS = [];
export const WEATHER = [];
export const THEMES = [];

export const GOOGLE_SCRIPT_URL = ""; // SET YOUR GOOGLE APPS SCRIPT WEBAPP URL HERE

export const STATUSES: ProductionStatus[] = [
  'Draft',
  'Ready',
  'Generated',
  'Edited',
  'Uploaded',
];

export const STATUS_COLORS = {
  Draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Ready: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Generated: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Edited: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Uploaded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
