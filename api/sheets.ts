import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL;

  if (!SCRIPT_URL) {
    return res.status(500).json({ 
      error: "VITE_GOOGLE_SCRIPT_URL not configured.",
      details: "Please add VITE_GOOGLE_SCRIPT_URL to your Vercel Environment Variables."
    });
  }

  if (!SCRIPT_URL.includes("script.google.com") || !SCRIPT_URL.includes("/exec")) {
    return res.status(400).json({ 
      error: "Invalid Google Script URL format.",
      details: "The URL must be a Web App URL (starting with script.google.com and ending with /exec). Ensure you clicked 'New Deployment' and copied the 'Web App URL', NOT the Spreadsheet URL."
    });
  }

  try {
    const url = new URL(SCRIPT_URL.trim());
    
    // Append query params
    Object.entries(req.query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const responseText = await response.text();

    if (!response.ok) {
      if (response.status === 404 && (responseText.includes("googlelogo") || responseText.includes("drive-logo"))) {
        return res.status(404).json({
          error: "Google Script Not Found",
          details: "Check your VITE_GOOGLE_SCRIPT_URL. Ensure it is a Web App URL ending in /exec."
        });
      }
      return res.status(response.status).send(responseText);
    }

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (e) {
      return res.status(200).send(responseText);
    }
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ 
      error: "Proxy failed", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
