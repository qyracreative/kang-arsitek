# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"

# Google Apps Script Web App URL for synchronization
# 1. Deploy your Apps Script as a Web App
# 2. Set 'Execute As' to 'Me' and 'Who has access' to 'Anyone'
# 3. Paste the provided URL below
VITE_GOOGLE_SCRIPT_URL="YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL"
