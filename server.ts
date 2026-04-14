import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import axios from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Instagram OAuth URL
  app.get("/api/auth/instagram/url", (req, res) => {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.APP_URL}/auth/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "INSTAGRAM_CLIENT_ID not configured" });
    }

    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
    res.json({ url: authUrl });
  });

  // YouTube OAuth URL
  app.get("/api/auth/youtube/url", (req, res) => {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${process.env.APP_URL}/auth/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "YOUTUBE_CLIENT_ID not configured" });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline`;
    res.json({ url: authUrl });
  });

  // OAuth Callback
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.send("No code provided");
    }

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body style="background: #050505; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', code: '${code}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <div style="text-align: center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            <h2 style="margin-bottom: 0.5rem; background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Success!</h2>
            <p style="color: rgba(255,255,255,0.6);">Authentication complete. Closing window...</p>
          </div>
        </body>
      </html>
    `);
  });

  // Mock YouTube Insights Data
  app.get("/api/youtube/insights", (req, res) => {
    res.json({
      retention: 54,
      skipRate: 18,
      averageWatchTime: 185.2, // seconds
      totalViews: 45200,
      engagementRate: 3.8,
      recentPosts: [
        { id: "y1", type: "VIDEO", views: 24000, retention: 58, skipRate: 12 },
        { id: "y2", type: "SHORTS", views: 15200, retention: 48, skipRate: 25 },
        { id: "y3", type: "VIDEO", views: 6000, likes: 850, comments: 120 }
      ]
    });
  });

  // Competitor Analysis Endpoint (Mock/Proxy)
  app.post("/api/competitor/analyze", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // In a real app, you'd fetch metadata from YouTube/Instagram API
    // For now, we'll return mock metadata that Gemini can analyze
    res.json({
      title: "How I Gained 100k Subs in 30 Days",
      views: "1.2M",
      uploadDate: "2 weeks ago",
      duration: "12:45",
      description: "In this video, I share my exact strategy for viral growth...",
      tags: ["growth", "viral", "strategy", "youtube tips"],
      thumbnailUrl: "https://picsum.photos/seed/viral/800/450"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
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
