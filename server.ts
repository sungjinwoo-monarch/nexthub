import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getPlayerCardData, sanitizeUsername } from './src/utils/githubFetcher.ts';
import { generateCardSvg } from './src/utils/svgGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // 1. Player JSON API endpoint
  app.get('/api/player/*', async (req, res) => {
    try {
      const usernameParam = req.params[0] || '';
      const countryOverride = req.query.country as string | undefined;
      
      const cleanUsername = sanitizeUsername(usernameParam);
      if (!cleanUsername) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const playerData = await getPlayerCardData(cleanUsername, countryOverride);
      return res.json(playerData);
    } catch (err: any) {
      console.error('Error fetching player data API:', err.message);
      return res.status(500).json({ error: err.message || 'Failed to fetch player data' });
    }
  });

  // 2. Dynamic Image Endpoint (SVG returned as image/svg+xml for maximum sharpness and fidelity)
  // Supports query params like ?country=DZ
  // Accessible at /:username.png (as requested)
  app.get('/*.png', async (req, res) => {
    try {
      const usernameParam = req.params[0] || '';
      const countryOverride = req.query.country as string | undefined;

      // Strip .png if present
      let rawUsername = usernameParam;
      if (rawUsername.endsWith('.png')) {
        rawUsername = rawUsername.slice(0, -4);
      }

      const cleanUsername = sanitizeUsername(rawUsername);
      if (!cleanUsername || cleanUsername === 'favicon' || cleanUsername === 'assets') {
        return res.status(404).send('Not found');
      }

      const playerData = await getPlayerCardData(cleanUsername, countryOverride);
      const svg = generateCardSvg(playerData);

      // Set content headers for an image and configure cache control for high performance
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=900, s-maxage=900, stale-while-revalidate=600');
      
      return res.send(svg);
    } catch (err: any) {
      console.error('Error generating card image:', err.message);
      return res.status(500).send('Error generating card image');
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GitHub Squad] Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
