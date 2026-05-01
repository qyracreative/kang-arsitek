import { Project, ProductionStatus, ScenePrompt } from '../types';

// Use our internal proxy endpoint to avoid CORS issues with Google Apps Script
const getScriptUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/sheets`;
  }
  return '/api/sheets';
};

const SCRIPT_URL = getScriptUrl();

// We now check if the real URL is configured in the environment (on the server side)
// But for the client, we just need to know if the proxy is "available"
// Since we control the server, we assume it is.
export const isSheetSyncConfigured = () => {
  return true;
};

const buildUrl = (baseUrl: string, params: Record<string, string> = {}) => {
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch (e) {
    // Fallback for simple string concatenation if URL is invalid (unlikely to work anyway)
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return queryString ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}` : baseUrl;
  }
};

export const syncProjectToSheets = async (project: Project): Promise<boolean> => {
  if (!isSheetSyncConfigured()) {
    console.warn('Google Script URL is not configured. Sync to Google Sheets is disabled.');
    return false;
  }

  const formatScene = (scene?: ScenePrompt) => {
    if (!scene) return '';
    // If it has specialized fields, join them. Otherwise use content.
    if (scene.visualPrompt) {
      return `Visual: ${scene.visualPrompt} | Camera: ${scene.cameraEffect} | Audio: ${scene.soundEffect} | Dialog: ${scene.dialog}`;
    }
    return scene.content || '';
  };

  const payload = {
    action: 'saveProject',
    projectId: project.id,
    title: project.title,
    character: project.character,
    characterPrompt: project.characterPrompt,
    location: project.location,
    locationPrompt: project.locationPrompt,
    building: project.building,
    buildingPrompt: project.buildingPrompt,
    weather: project.weather,
    weatherPrompt: project.weatherPrompt,
    theme: project.theme,
    themePrompt: project.themePrompt,
    status: project.status,
    scene1: formatScene(project.prompts[0]),
    scene2: formatScene(project.prompts[1]),
    scene3: formatScene(project.prompts[2]),
    scene4: formatScene(project.prompts[3]),
    scene5: formatScene(project.prompts[4]),
    scene6: formatScene(project.prompts[5]),
    scene7: formatScene(project.prompts[6]),
    scene8: formatScene(project.prompts[7]),
    reelCaption: project.reelCaption || "",
    ytShortTitle: project.ytShortTitle || "",
    ytShortDesc: project.ytShortDesc || "",
    ytShortHash: project.ytShortHash || "",
    tiktokCaption: project.tiktokCaption || "",
    createdAt: new Date(project.createdAt).toISOString(),
  };

  console.log('Sending payload to proxy:', payload);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Proxy responded with error: ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMsg += ` - ${errorJson.error}`;
        if (errorJson.details) errorMsg += ` (${errorJson.details})`;
      } catch (e) {
        errorMsg += ` - ${text}`;
      }
      console.error(errorMsg);
      return false;
    }

    return true; 
  } catch (error) {
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('Load failed'))) {
      console.error('CRITICAL: Google Sheets Fetch Error (Possible CORS or Connectivity issue):', error);
      console.warn('Endpoint attempted:', SCRIPT_URL);
    } else {
      console.error('Sheet Sync Error (POST):', error);
    }
    return false;
  }
};

export const fetchProjectsFromSheets = async (): Promise<Project[] | null> => {
  if (!isSheetSyncConfigured()) {
    return null;
  }

  try {
    const response = await fetch(buildUrl(SCRIPT_URL), {
      method: 'GET',
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Sync Server Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMsg = errorJson.error;
        if (errorJson.details) errorMsg += ` (${errorJson.details})`;
      } catch (e) {
        errorMsg += ` - ${text.substring(0, 100)}`;
      }
      
      if (response.status === 404) {
        throw new Error(`Google Script URL Mismatch (404). ${errorMsg}`);
      }
      throw new Error(errorMsg);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array of projects.');
      }

      return data as Project[];
    } catch (e) {
      if (text.startsWith('<!doctype') || text.includes('google-signin')) {
        throw new Error('Google is asking for login. Please check "Who has access" is set to "Anyone" in your Apps Script deployment.');
      }
      throw new Error(`Failed to parse JSON from Google. Response started with: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('Load failed'))) {
      console.error('CRITICAL: Google Sheets Fetch Error (Possible CORS or Connectivity issue):', error);
      console.warn('Endpoint attempted:', SCRIPT_URL);
      console.warn('This usually happens because the Google Apps Script is not publicly accessible.');
      console.warn('FIX STEPS:');
      console.warn('1. Open your Apps Script editor.');
      console.warn('2. Click "Deploy" > "Manage deployments".');
      console.warn('3. Ensure "Who has access" is set to "Anyone" (NOT "Anyone with Google Account").');
      console.warn('4. Ensure "Execute as" is set to "Me".');
      console.warn('5. If you changed settings, you MUST create a "New Deployment" (Version: New) to get a new active URL.');
    } else {
      console.error('Sync Error (GET):', error);
    }
    return null;
  }
};

export const updateProjectStatusInSheets = async (projectId: string, status: ProductionStatus): Promise<boolean> => {
  if (!isSheetSyncConfigured()) return false;

  const payload = {
    action: 'updateStatus',
    projectId,
    status,
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Proxy responded with error: ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMsg += ` - ${errorJson.error}`;
        if (errorJson.details) errorMsg += ` (${errorJson.details})`;
      } catch (e) {
        errorMsg += ` - ${text}`;
      }
      console.error(errorMsg);
      return false;
    }

    return true; 
  } catch (error) {
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('Load failed'))) {
      console.error('CRITICAL: Google Sheets Fetch Error (Possible CORS or Connectivity issue):', error);
      console.warn('Endpoint attempted:', SCRIPT_URL);
    } else {
      console.error('Sheet Sync Error (Update):', error);
    }
    return false;
  }
};

export interface ConfigOptions {
  characters: string[];
  locations: string[];
  buildings: string[];
  weather: string[];
  themes: string[];
}

export const fetchOptionsFromSheets = async (): Promise<ConfigOptions | null> => {
  if (!isSheetSyncConfigured()) {
    return null;
  }

  try {
    const response = await fetch(buildUrl(SCRIPT_URL, { type: 'options' }), {
      method: 'GET',
      cache: 'no-cache', // Ensure we get fresh data
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Sync Server Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMsg = errorJson.error;
        if (errorJson.details) errorMsg += ` (${errorJson.details})`;
      } catch (e) {
        errorMsg += ` - ${text.substring(0, 100)}`;
      }
      
      if (response.status === 404) {
        throw new Error(`Google Script URL Mismatch (404). ${errorMsg}`);
      }
      throw new Error(errorMsg);
    }
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data as ConfigOptions;
    } catch (e) {
      if (text.startsWith('<!doctype') || text.includes('google-signin')) {
        throw new Error('Google is asking for login. Please check "Who has access" is set to "Anyone" in your Apps Script deployment.');
      }
      throw new Error(`Failed to parse JSON from Google. Response started with: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('Load failed'))) {
      console.error('CRITICAL: Google Sheets Fetch Error (Possible CORS or Connectivity issue):', error);
      console.warn('Endpoint attempted:', SCRIPT_URL);
      console.warn('This usually happens because the Google Apps Script is not publicly accessible.');
      console.warn('FIX STEPS:');
      console.warn('1. Open your Apps Script editor.');
      console.warn('2. Click "Deploy" > "Manage deployments".');
      console.warn('3. Ensure "Who has access" is set to "Anyone" (NOT "Anyone with Google Account).');
      console.warn('4. Ensure "Execute as" is set to "Me".');
      console.warn('5. If you changed settings, you MUST create a "New Deployment" (Version: New) to get a new active URL.');
    } else if (!(error instanceof Error && error.message.includes('404'))) {
      console.error('Fetch options failed:', error);
    }
    return null;
  }
};
