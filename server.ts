import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Proxy endpoint for Google Sheets to avoid CORS
  app.all("/api/sheets", async (req, res) => {
    const SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL;
    if (!SCRIPT_URL) {
      return res.status(500).json({ error: "VITE_GOOGLE_SCRIPT_URL not configured on server. Please add it to your project secrets." });
    }

    if (!SCRIPT_URL.includes("script.google.com") || !SCRIPT_URL.includes("/exec")) {
      console.warn(`[Proxy] Invalid Script URL blocked: ${SCRIPT_URL}`);
      return res.status(400).json({ 
        error: "Invalid Google Script URL format.",
        details: "The URL must be a Web App URL (starting with script.google.com and ending with /exec). Ensure you clicked 'New Deployment' and copied the 'Web App URL', NOT the Spreadsheet URL."
      });
    }

    try {
      const url = new URL(SCRIPT_URL.trim());
      // Append query params from client
      Object.entries(req.query).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      console.log(`Proxying ${req.method} to Google Sheets: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: req.method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });

      const contentType = response.headers.get("content-type");
      const responseText = await response.text();

      if (!response.ok) {
        console.error(`[Proxy] Google Sheets Error Response (${response.status}) from ${url.hostname}:`, responseText.substring(0, 500));
        // If it's a 404 and looks like a Drive page, it's a wrong URL
        if (response.status === 404 && (responseText.includes("googlelogo") || responseText.includes("drive-logo"))) {
          return res.status(404).json({
            error: "Google Script Not Found",
            details: "Google returned a 'File Not Found' page. This happens if the Script URL is incorrect or the script project was deleted. Double check your VITE_GOOGLE_SCRIPT_URL."
          });
        }
        return res.status(response.status).send(responseText);
      }

      if (contentType && contentType.includes("application/json")) {
        try {
          const data = JSON.parse(responseText);
          res.json(data);
        } catch (e) {
          console.error("Failed to parse JSON from Google:", responseText.substring(0, 500));
          res.status(502).json({ 
            error: "Incomplete JSON response from Google",
            details: "Google returned a 200 OK but the body was not valid JSON." 
          });
        }
      } else {
        // It's likely HTML (Google Login or Error page)
        console.warn("Google returned non-JSON response:", responseText.substring(0, 500));
        res.status(502).json({
          error: "Non-JSON response from Google",
          details: responseText.startsWith("<!doctype") || responseText.includes("google-signin") 
            ? "Google is asking for login. Ensure your Apps Script is deployed with 'Who has access: Anyone'."
            : "The script returned HTML instead of JSON."
        });
      }
    } catch (error) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Failed to proxy request to Google Sheets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
