import { PromptState, ScenePrompt } from '../types';

export const generateScenes = (state: PromptState): ScenePrompt[] => {
  const { character, location, building, weather, theme } = state;

  const baseConfig = `${character} in ${location}, atmosphere: ${weather}, style: ${theme}`;

  const templates = [
    {
      title: "Scene 1: Establishing Shot",
      content: `Wide cinematic establishing shot of the ${character} standing with back to camera facing the empty ${location}. The camera slowly orbits to show the surrounding environment including the spot where ${building} will be built. ${weather}, ${theme}.`
    },
    {
      title: "Scene 2: The Decision",
      content: `Medium cinematic shot of the ${character} thinking, left arm folded, right hand touching chin. Character looks towards the site and nodes, saying "Ok, kerjakan". Background: ${location}, ${weather}, ${theme}.`
    },
    {
      title: "Scene 3: Blueprint POV",
      content: `First-person POV, ${character} lifts a large blueprint labeled "Kang Arsitek" with both hands until it covers the entire screen. Soft focus on the background ${location}, ${theme}.`
    },
    {
      title: "Scene 4: 25% Progress",
      content: `Blueprint lowers revealing 25% construction progress of the ${building} at ${location}. Skeletal structures and foundation visible. Then blueprint rises again to cover the screen. ${weather}, ${theme}.`
    },
    {
      title: "Scene 5: 50% Progress",
      content: `Blueprint lowers revealing 50% construction progress of the ${building}. Walls are up, main structure is evident at ${location}. Then blueprint rises again to cover the screen. ${weather}, ${theme}.`
    },
    {
      title: "Scene 6: 75% Progress",
      content: `Blueprint lowers revealing 75% construction progress. Windows and exterior finishes being applied to the ${building} at ${location}. Then blueprint rises again to cover the screen. ${weather}, ${theme}.`
    },
    {
      title: "Scene 7: Completion Reveal",
      content: `Blueprint lowers revealing the fully completed ${building} at ${location}. The camera moves forward dramatically towards the structure. ${weather}, ${theme}. Pristine architectural details.`
    },
    {
      title: "Scene 8: The Conclusion",
      content: `Cinematic montage showcasing the completed ${building} from multiple dynamic angles. Final medium close-up of ${character} looking at the camera, smiling slightly and saying "Ok, selesai". ${location}, ${weather}, ${theme}.`
    }
  ];

  return templates.map((scene, index) => ({
    id: index + 1,
    title: scene.title,
    content: scene.content
  }));
};
