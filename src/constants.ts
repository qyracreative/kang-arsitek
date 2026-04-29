import { ProductionStatus } from './types';

export const CHARACTERS = [
  "A lone futuristic architect",
  "A group of nomadic travelers",
  "A digital nomad with a holographic laptop",
  "A street photographer capturing shadows",
  "A mysterious hooded figure",
  "A child playing with a glowing kite",
  "An elderly curator in a grand museum",
  "A robotic maintenance crew",
];

export const LOCATIONS = [
  "The neon-lit streets of Neo-Tokyo",
  "A suspended forest above a cloud layer",
  "A brutalist concrete oasis in the desert",
  "Submerged ruins of a coastal city",
  "A high-altitude arctic research station",
  "The bustling marketplaces of Marrakech 2099",
  "An abandoned space elevator terminal",
  "Hidden valley beneath a waterfall",
];

export const BUILDINGS = [
  "A spiraling glass cathedral",
  "Modular floating housing blocks",
  "A monolithic obsidian library",
  "Sustainable bamboo skyscrapers",
  "A transparent underwater dome",
  "Retro-futuristic art deco hotels",
  "An overgrown botanical atrium",
  "A kinetic shape-shifting museum",
];

export const WEATHER = [
  "Heavy monsoon rain with cinematic reflections",
  "Soft amber sunset with dusty air particles",
  "Dense electromagnetic fog",
  "Crisp blue hour with glowing neon lights",
  "Blinding desert sandstorm with orange tint",
  "Ethereal northern lights dancing above",
  "Hyper-realistic midday sun with sharp shadows",
  "Soft bioluminescent glow from local flora",
];

export const THEMES = [
  "Cyberpunk Noir",
  "Solarpunk Utopia",
  "Ancient-Future Fusion",
  "Minimalist Zen",
  "Industrial Dystopia",
  "Organic Surrealism",
  "Retro-Space Age",
  "Gothic High-Tech",
];

export const STATUSES: ProductionStatus[] = [
  'Draft',
  'Ready',
  'Generated',
  'Edited',
  'Uploaded',
];

export const STATUS_COLORS = {
  Draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Ready: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Generated: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Edited: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Uploaded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
