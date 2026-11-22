import { createBackendApp } from './app.ts';
import { ensureMlServiceRunning } from './services/mlClient.ts';

const port = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);

async function startStandaloneBackend() {
  const app = createBackendApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`[CareerMind] Standalone Express backend listening on http://localhost:${port}`);
    ensureMlServiceRunning().catch((err) => {
      console.error('[CareerMind] ML service startup warning:', err);
    });
  });
}

startStandaloneBackend().catch((err) => {
  console.error('[CareerMind] Failed to start backend:', err);
  process.exit(1);
});
