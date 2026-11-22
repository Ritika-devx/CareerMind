import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createBackendApp } from './backend/app.ts';
import { ensureMlServiceRunning } from './backend/services/mlClient.ts';

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = createBackendApp();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CareerMind] Server listening on http://localhost:${PORT}`);
    ensureMlServiceRunning().catch((err) => {
      console.error('[CareerMind] ML service startup warning:', err);
    });
  });
}

startServer().catch((err) => {
  console.error('[CareerMind] Failed to start server:', err);
  process.exit(1);
});
