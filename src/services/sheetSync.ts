import { Project, ProductionStatus } from '../types';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export const isSheetSyncConfigured = () => {
  if (!SCRIPT_URL || SCRIPT_URL === '' || SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
    return false;
  }
  try {
    // Basic URL validation
    const url = new URL(SCRIPT_URL);
    return url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export const syncProjectToSheets = async (project: Project): Promise<boolean> => {
  if (!isSheetSyncConfigured()) {
    console.warn('Google Script URL is not configured. Sync to Google Sheets is disabled.');
    return false;
  }

  const payload = {
    action: 'saveProject',
    projectId: project.id,
    title: project.title,
    character: project.character,
    location: project.location,
    building: project.building,
    weather: project.weather,
    theme: project.theme,
    status: project.status,
    scene1: project.prompts[0]?.content || '',
    scene2: project.prompts[1]?.content || '',
    scene3: project.prompts[2]?.content || '',
    scene4: project.prompts[3]?.content || '',
    scene5: project.prompts[4]?.content || '',
    scene6: project.prompts[5]?.content || '',
    scene7: project.prompts[6]?.content || '',
    scene8: project.prompts[7]?.content || '',
    createdAt: new Date(project.createdAt).toISOString(),
  };

  try {
    // Mode 'no-cors' allows sending data to Apps Script without CORs issues for POST,
    // although we cannot read the response body.
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', // Prevents preflight OPTIONS request
      },
      body: JSON.stringify(payload),
    });
    return true; 
  } catch (error) {
    console.error('Sheet Sync Error (POST):', error);
    return false;
  }
};

export const fetchProjectsFromSheets = async (): Promise<Project[] | null> => {
  if (!isSheetSyncConfigured()) {
    return null;
  }

  try {
    // A simple GET request (no custom headers) is less likely to trigger CORS preflight.
    // Google Apps Script will handle this via its redirect mechanism.
    const response = await fetch(SCRIPT_URL);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Script URL not found (404). Check your VITE_GOOGLE_SCRIPT_URL.');
      }
      throw new Error(`Cloud Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: Expected an array of projects.');
    }

    return data as Project[];
  } catch (error) {
    // "Failed to fetch" is almost always a CORS or Network error with Apps Script
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Google Sheets Connection Blocked (CORS):');
      console.warn('1. Your VITE_GOOGLE_SCRIPT_URL might be wrong or missing.');
      console.warn('2. Your Apps Script MUST be deployed as "Web App".');
      console.warn('3. "Who has access" MUST be set to "Anyone" (not Anyone with Google Account).');
      console.warn('4. Ensure your browser is not blocking the connection (e.g., ad-blockers).');
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
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Sheet Sync Error (Update):', error);
    return false;
  }
};
