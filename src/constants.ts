import { ProductionStatus } from './types';

export const CHARACTERS = [
  "young female architect with tied black hair, stylish architect blazer, yellow construction helmet",
  "mature male architect with architect vest, white construction helmet",
];

export const LOCATIONS = [
  "dense tropical forest clearing",
  "beachside sandy construction site",
  "rocky mountain plateau",
];

export const BUILDINGS = [
  "luxurious modern tropical villa with glass walls",
  "elegant minimalist house",
  "futuristic glass skyscraper",
];

export const WEATHER = [
  "bright golden sunlight with vibrant atmosphere",
  "dramatic rainy daylight with wet surfaces",
];

export const THEMES = [
  "luxury cinematic style",
  "futuristic cinematic style",
];

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
