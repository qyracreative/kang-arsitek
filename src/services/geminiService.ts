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

const SYSTEM_PROMPT = `You are an expert cinematic prompt generator for Google Veo and a viral social media marketer.

Your tasks:
1. Create a complete 8-scene cinematic short video prompt for an AI-generated architectural transformation video.
2. Create a viral social media kit in Indonesian.

The video concept is about an architect building a structure from an empty land into a finished masterpiece, designed for TikTok, Reels, and YouTube Shorts, with a total duration of around 1 minute.

You will receive these inputs:
1. Character Prompt = description of the architect character
2. Location Prompt = description of the empty land/environment
3. Building Prompt = description of the final building
4. Weather Prompt = lighting/weather atmosphere
5. Theme Prompt = cinematic visual style

--- TASK 1: THE SCENES ---
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
Scene 8: Multiple angles of completed building, glitch transition to architect medium close-up, Dialog: "Pembangunan selesai. Siap untuk proyek berikutnya"

--- TASK 2: SOCIAL MEDIA KIT ---
Generate viral metadata in Indonesian for Facebook Reels, YouTube Shorts, and TikTok. 

CRITICAL instruction for titles: 
"buat judul yang menarik dan akan viral buat judul bisa berdeda atau sama dari ke 3 media sosial itu. Pastikan Reels dan TikTok juga memiliki judul viral di bagian awal captionnya."

Generate:
- reelCaption (Facebook/Instagram Reels caption - START WITH A VIRAL TITLE)
- ytShortTitle (YouTube Shorts title)
- ytShortDesc (YouTube Shorts description)
- ytShortHash (YouTube Shorts hashtags)
- tiktokCaption (TikTok caption - START WITH A VIRAL TITLE)

--- OUTPUT FORMAT ---
IMPORTANT: Return only a raw JSON object. Do not include markdown code blocks or any other text.
{
  "scenes": [
    {
      "id": (number),
      "title": (string, e.g. "Scene 1: The Vision"),
      "visualPrompt": (string),
      "cameraEffect": (string),
      "soundEffect": (string),
      "dialog": (string)
    },
    ... (8 scenes total)
  ],
  "socialMedia": {
    "reelCaption": (string),
    "ytShortTitle": (string),
    "ytShortDesc": (string),
    "ytShortHash": (string),
    "tiktokCaption": (string)
  }
}`;

export const generateCinematicPrompts = async (state: PromptState): Promise<{ scenes: ScenePrompt[], socialMedia: any }> => {
  const model = "gemini-3-flash-preview";
  
  // Use specialized prompt fields if provided, otherwise fallback to base fields
  const character = state.characterPrompt || state.character;
  const location = state.locationPrompt || state.location;
  const building = state.buildingPrompt || state.building;
  const weather = state.weatherPrompt || state.weather;
  const theme = state.themePrompt || state.theme;

  const prompt = `
    Character: ${character}
    Location: ${location}
    Building: ${building}
    Weather: ${weather}
    Theme: ${theme}

    Use the system instructions to generate the 8 scenes and viral social media kit based on these inputs.
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
    
    // Robust JSON extraction to handle cases where AI adds extra text or markdown blocks
    let cleanText = text.trim();
    if (cleanText.includes("```json")) {
      cleanText = cleanText.split("```json")[1].split("```")[0].trim();
    } else if (cleanText.includes("```")) {
      cleanText = cleanText.split("```")[1].split("```")[0].trim();
    }
    
    // If there's still noise after the last brace (common error reported: "Unexpected non-whitespace character after JSON")
    const lastBraceIndex = cleanText.lastIndexOf("}");
    if (lastBraceIndex !== -1) {
      cleanText = cleanText.substring(0, lastBraceIndex + 1);
    }
    
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON Parse Error. Cleaned text snippet:", cleanText.substring(0, 100) + "...");
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }

    let scenes = data.scenes as ScenePrompt[];
    const socialMedia = data.socialMedia;

    // Post-processing for Scene 8 (User request: Scene 8 must have specific dialogue)
    if (scenes && scenes.length >= 8) {
      scenes[7].dialog = "Pembangunan selesai. Siap untuk proyek berikutnya";
    }
    
    return { scenes, socialMedia };
  } catch (error) {
    console.error("Error generating cinematic prompts:", error);
    throw error;
  }
};
