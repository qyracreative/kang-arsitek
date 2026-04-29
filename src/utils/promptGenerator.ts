import { PromptState, ScenePrompt } from '../types';

export const generateScenes = (state: PromptState): ScenePrompt[] => {
  const { character, location, building, weather, theme } = state;

  const templates = [
    `Establishing wide shot: ${location}. The camera slowly pans across the ${building}, revealing its intricate details under the ${weather}. The atmosphere is defined by a ${theme} aesthetic. No characters visible yet.`,
    `Medium shot: ${character} stands before the entrance of the ${building}. The air is thick with ${weather}. A holographic display flickers, casting a glow that reinforces the ${theme} vibe of ${location}.`,
    `Low angle hero shot: Looking up at the ${building} towering into the ${weather} sky. ${character} is a small silhouette against the massive scale. The ${theme} architecture feels imposing yet beautiful.`,
    `Extreme close-up: A detail of the ${building}'s textures—weathered ${theme} materials glistening under the ${weather}. The camera pulls back to reveal ${character} reflecting in a glass surface.`,
    `Dynamic tracking shot: Following ${character} as they navigate the interiors of ${building}. The ${weather} outside leaks through skylights, shifting the ${theme} lighting across the ${location} environment.`,
    `Cinematic birds-eye view: The ${building} situated in the heart of ${location}. The scale of the structure is highlighted by the ${weather}. The ${theme} layout reveals hidden structural symmetries.`,
    `Interior moody shot: ${character} sits in a quiet corner of the ${building}, looking out at ${location}. The ${weather} creates a somber yet peaceful ${theme} atmosphere. Soft lens flares.`,
    `Final dramatic exit: ${character} walking away from the ${building} into the ${location} cityscape. The ${weather} reaches its peak intensity, wrapping the entire scene in a definitive ${theme} cinematic finish.`
  ];

  return templates.map((template, index) => ({
    id: index + 1,
    title: `Scene ${index + 1}`,
    content: template
  }));
};
