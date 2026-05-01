import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for Google Sheets to avoid CORS
  app.all("/api/sheets", async (req, res) => {
    const SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL;
    if (!SCRIPT_URL) {
      return res.status(500).json({ error: "VITE_GOOGLE_SCRIPT_URL not configured on server" });
    }

    try {
      const url = new URL(SCRIPT_URL);
      // Append query params from client
      Object.entries(req.query).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      console.log(`Proxying ${req.method} to Google Sheets: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: req.method,
        // Using text/plain to avoid any weirdness with GAS and Content-Type
        headers: {
          "Content-Type": "text/plain",
        },
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Sheets Error Response (${response.status}):`, errorText);
        return res.status(response.status).send(errorText);
      }

      const data = await response.json();
      res.json(data);
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
