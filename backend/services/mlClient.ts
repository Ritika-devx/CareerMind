import { ChildProcess, spawn } from 'child_process';
import path from 'path';

export const ML_SERVICE_URL = (
  process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001'
).replace(/\/$/, '');

let mlChildProcess: ChildProcess | null = null;

async function callMl<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ML_SERVICE_URL}${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    throw new MlServiceUnavailableError(
      `Python ML inference service is unreachable at ${ML_SERVICE_URL} (${message}).`
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail =
      typeof payload?.error === 'string'
        ? payload.error
        : `ML service responded with status ${response.status}`;
    throw new MlServiceRequestError(detail, response.status);
  }
  return payload as T;
}

export class MlServiceUnavailableError extends Error {
  public readonly statusCode = 503;
  constructor(message: string) {
    super(message);
    this.name = 'MlServiceUnavailableError';
  }
}

export class MlServiceRequestError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'MlServiceRequestError';
    this.statusCode = statusCode;
  }
}

export interface MlHealthResponse {
  status: string;
  service: string;
  models_loaded: boolean;
  artifacts: Record<string, string>;
}

export interface MlMetadataResponse {
  models_loaded: boolean;
  classifier: {
    artifact: string;
    estimator: string;
    expected_features: string[];
    classes: string[];
    supports_predict_proba: boolean;
  };
  salary: {
    artifact: string;
    estimator: string;
    n_estimators: number;
    max_depth: number;
    min_samples_leaf: number;
    expected_features: string[];
    locations: string[];
    experience_levels: string[];
    job_categories: string[];
  };
  clustering: {
    artifact: string;
    estimator: string;
    text_columns: string[];
    pca_components: number;
    selected_k: number;
    vocabulary_size: number;
    cluster_centers: number[][];
  };
}

export interface MlClassifyResponse {
  predicted_category: string;
  decision_scores: Array<{ category: string; decision_score: number }>;
  top_decision_score: number | null;
  supports_probabilities: boolean;
  model_info: {
    artifact: string;
    algorithm: string;
    expected_columns: string[];
  };
  processed_input: {
    combined_text: string;
    location: string;
    experience_midpoint_years: number;
  };
}

export interface MlSalaryResponse {
  predicted_salary_inr: number;
  model_info: {
    artifact: string;
    algorithm: string;
    expected_columns: string[];
  };
  used_features: Record<string, unknown>;
}

export interface MlClusterResponse {
  cluster_id: number;
  pca_coordinates: [number, number];
  cluster_distances: Array<{
    cluster_id: number;
    distance: number;
    center: [number, number];
  }>;
  combined_text: string;
  model_info: {
    artifact: string;
    algorithm: string;
    selected_k: number;
    pca_components: number;
  };
}

async function waitForMlReadyIfStarting(): Promise<void> {
  if (mlStartPromise) {
    try {
      await mlStartPromise;
    } catch {
      // Let the downstream fetch surface MlServiceUnavailableError
    }
  }
}

async function callMlWithRecovery<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  await waitForMlReadyIfStarting();
  try {
    return await callMl<T>(endpoint, options);
  } catch (err) {
    if (err instanceof MlServiceUnavailableError) {
      await ensureMlServiceRunning().catch(() => {});
      return callMl<T>(endpoint, options);
    }
    throw err;
  }
}

export const mlClient = {
  getHealth: () => callMl<MlHealthResponse>('/health', { method: 'GET' }),
  getMetadata: () => callMlWithRecovery<MlMetadataResponse>('/metadata', { method: 'GET' }),
  classify: (body: {
    job_title: string;
    job_description: string;
    skills: string;
    location: string;
    experience_midpoint_years: number;
  }) =>
    callMlWithRecovery<MlClassifyResponse>('/predict/classify', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  predictSalary: (body: {
    job_title: string;
    job_description: string;
    skills: string;
    job_category: string;
    location: string;
    experience_level: string;
    experience_midpoint_years: number;
    experience_min_years: number;
    experience_max_years: number;
  }) =>
    callMlWithRecovery<MlSalaryResponse>('/predict/salary', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  cluster: (body: { job_title: string; skills: string }) =>
    callMlWithRecovery<MlClusterResponse>('/predict/cluster', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

let mlStartPromise: Promise<void> | null = null;
let shutdownHooksRegistered = false;

function runCommandAsync(cmd: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) console.log(`[ml-bootstrap] ${text}`);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) console.log(`[ml-bootstrap] ${text}`);
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function ensurePipAvailable(pythonBin: string): Promise<void> {
  const hasPip = await runCommandAsync(pythonBin, ['-m', 'pip', '--version']).catch(() => 1);
  if (hasPip === 0) {
    return;
  }

  console.log('[CareerMind] pip module not found; trying ensurepip...');
  const ensurePipCode = await runCommandAsync(pythonBin, [
    '-m',
    'ensurepip',
    '--upgrade',
  ]).catch(() => 1);
  if (ensurePipCode === 0) {
    return;
  }

  console.log('[CareerMind] ensurepip unavailable; bootstrapping pip via get-pip.py...');
  const bootstrapCode = await runCommandAsync(pythonBin, [
    '-c',
    [
      'import os, tempfile, urllib.request, subprocess, sys',
      "fd, path = tempfile.mkstemp(suffix='.py', prefix='get-pip-')",
      'os.close(fd)',
      'try:',
      "    urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', path)",
      "    subprocess.check_call([sys.executable, path, '--break-system-packages', '--no-warn-script-location'])",
      'finally:',
      '    if os.path.exists(path): os.remove(path)',
    ].join('\n'),
  ]);
  if (bootstrapCode !== 0) {
    throw new Error(`Failed to bootstrap pip (exit code ${bootstrapCode})`);
  }
}

async function ensurePythonPackages(pythonBin: string): Promise<void> {
  const checkCode = await runCommandAsync(pythonBin, [
    '-c',
    'import flask, sklearn, joblib, pandas, numpy',
  ]).catch(() => 1);
  if (checkCode === 0) {
    return;
  }

  await ensurePipAvailable(pythonBin);

  const reqPath = path.join(process.cwd(), 'ml-service', 'requirements.txt');
  console.log('[CareerMind] Installing Python ML dependencies from requirements.txt...');
  const installCode = await runCommandAsync(pythonBin, [
    '-m',
    'pip',
    'install',
    '--no-cache-dir',
    '--break-system-packages',
    '-r',
    reqPath,
  ]);
  if (installCode !== 0) {
    throw new Error(`pip install failed with exit code ${installCode}`);
  }
}

/**
 * Ensures the local Python Flask ML service is running when the unified Express
 * server starts (e.g. `npm run dev` or `npm start`). If ML_SERVICE_URL already
 * responds to /health, reuses that external process without spawning another.
 */
export function ensureMlServiceRunning(): Promise<void> {
  if (mlStartPromise) {
    return mlStartPromise;
  }

  mlStartPromise = (async () => {
    try {
      await mlClient.getHealth();
      console.log(`[CareerMind] Connected to running ML service at ${ML_SERVICE_URL}`);
      return;
    } catch {
      // Not running yet — spawn ml-service/app.py locally
    }

    if (mlChildProcess && !mlChildProcess.killed) {
      return;
    }

    const mlAppPath = path.join(process.cwd(), 'ml-service', 'app.py');
    const parsedUrl = new URL(ML_SERVICE_URL);
    const mlPort = parsedUrl.port || '5001';
    const pythonBin = process.env.PYTHON_BIN || 'python';

    await ensurePythonPackages(pythonBin);

    console.log(`[CareerMind] Starting Python ML service (${mlAppPath}) on port ${mlPort}...`);
    mlChildProcess = spawn(pythonBin, [mlAppPath], {
      env: {
        ...process.env,
        ML_PORT: mlPort,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    mlChildProcess.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) console.log(`[ml-service] ${text}`);
    });
    mlChildProcess.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) console.log(`[ml-service] ${text}`);
    });
    mlChildProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.error(`[ml-service] exited with code ${code}`);
      }
      mlChildProcess = null;
    });

    if (!shutdownHooksRegistered) {
      shutdownHooksRegistered = true;
      const stopChild = () => {
        if (mlChildProcess && !mlChildProcess.killed) {
          mlChildProcess.kill('SIGTERM');
        }
      };
      process.once('SIGINT', stopChild);
      process.once('SIGTERM', stopChild);
      process.once('exit', stopChild);
    }

    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      try {
        await mlClient.getHealth();
        console.log(`[CareerMind] Python ML service ready at ${ML_SERVICE_URL}`);
        return;
      } catch {
        if (!mlChildProcess) {
          throw new Error('Python ML service process exited unexpectedly during startup.');
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
    throw new Error(`Timed out waiting for Python ML service at ${ML_SERVICE_URL}`);
  })().finally(() => {
    mlStartPromise = null;
  });

  return mlStartPromise;
}
