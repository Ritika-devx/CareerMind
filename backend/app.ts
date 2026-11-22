import express, { Request, Response, NextFunction } from 'express';
import apiRouter from './routes/api.ts';
import { dataService } from './services/dataService.ts';

export function createBackendApp() {
  // Preload dataset & results into memory at startup
  dataService.init();

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  // Return clean JSON errors for /api routes
  app.use('/api', (req: Request, res: Response) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const message =
      err instanceof Error ? err.message : 'An unexpected internal error occurred.';
    console.error('[CareerMind API Error]', err);
    res.status(500).json({ error: message });
  });

  return app;
}
