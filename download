import { GoogleGenAI } from "@google/genai";
import { PromptState, ScenePrompt } from "../types";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_PROMPT = `You are an expert cinematic prompt generator for Google Veo.

Your task is to create a complete 8-scene cinematic short video prompt for an AI-generated architectural transformation video.

The video concept is about an architect building a structure from an empty land into a finished masterpiece, designed for TikTok, Reels, and YouTube Shorts, with a total duration of around 1 minute.

You will receive these inputs:
1. Character Prompt = description of the architect character
2. Location Prompt = description of the empty land/environment
3. Building Prompt = description of the final building
4. Weather Prompt = lighting/weather atmosphere
5. Theme Prompt = cinematic visual style

Your output must create 8 cinematic scenes, each scene containing:
1. Visual Prompt
2. Camera Effect
3. Sound Effect
4. Dialog

All scenes must maintain:
- consistent character appearance
- consistent environment continuity
- consistent architectural style
- cinematic realism
- smooth progression from empty land to completed building
- realistic camera movement
- immersive sound design

Use the following 8-scene storyline:
Scene 1: Empty land, architect seen from behind, camera orbits.
Scene 2: Glitch transition, medium close-up, architect thinking (left arm folded, right elbow on left hand, right hand on chin), Dialog: "Ok, kerjakan."
Scene 3: Glitch transition, architect POV, raises blueprint with header "Kang Arsitek" covering land.
Scene 4: Glitch transition, blueprint lowers to reveal 25% progress, then raises.
Scene 5: Glitch transition, blueprint lowers to reveal 50% progress, then raises.
Scene 6: Glitch transition, blueprint lowers to reveal 75% progress, then raises.
Scene 7: Glitch transition, blueprint lowers to reveal 100% completion, camera moves closer.
Scene 8: Multiple angles of completed building, glitch transition to architect medium close-up, Dialog: "Ok, selesai."

IMPORTANT: Return only a raw JSON array of 8 objects, each with:
"id" (number), "title" (string, e.g. "Scene 1: The Vision"), "visualPrompt" (string), "cameraEffect" (string), "soundEffect" (string), "dialog" (string).
Do not include markdown code blocks or any other text.`;

export const generateCinematicPrompts = async (state: PromptState): Promise<ScenePrompt[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Character: ${state.character}
    Location: ${state.location}
    Building: ${state.building}
    Weather: ${state.weather}
    Theme: ${state.theme}

    Use the system instructions to generate the 8 scenes based on these inputs.
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as ScenePrompt[];
  } catch (error) {
    console.error("Error generating cinematic prompts:", error);
    throw error;
  }
};
