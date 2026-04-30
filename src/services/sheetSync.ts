import { Project, ProductionStatus } from '../types';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export const syncProjectToSheets = async (project: Project): Promise<boolean> => {
  if (!SCRIPT_URL) {
    console.warn('Google Script URL is not configured. Sync skipped.');
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
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script often requires no-cors for simple POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true; // With no-cors, we can't really read the response status, but we assume success if no error is thrown
  } catch (error) {
    console.error('Failed to sync to Google Sheets:', error);
    return false;
  }
};

export const fetchProjectsFromSheets = async (): Promise<Project[] | null> => {
  if (!SCRIPT_URL) return null;

  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data as Project[];
  } catch (error) {
    console.error('Failed to fetch from Google Sheets:', error);
    return null;
  }
};

export const updateProjectStatusInSheets = async (projectId: string, status: ProductionStatus): Promise<boolean> => {
  if (!SCRIPT_URL) return false;

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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Failed to update status in Google Sheets:', error);
    return false;
  }
};
