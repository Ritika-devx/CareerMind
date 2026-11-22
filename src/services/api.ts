import type {
  ClassificationResponse,
  ClusteringResponse,
  ClustersOverviewResponse,
  DashboardData,
  JobsExplorerResponse,
  ModelMetricsResponse,
  SalaryPredictionResponse,
} from '../types/careermind';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof body?.error === 'string'
        ? body.error
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}

export const careerMindApi = {
  getHealth: () => requestJson<{ status: string; dataset_records: number }>('/api/health'),
  getDashboard: () => requestJson<DashboardData>('/api/dashboard'),
  classifyJob: (payload: {
    job_title: string;
    job_description: string;
    skills: string;
    location: string;
    experience_midpoint_years: number;
  }) =>
    requestJson<ClassificationResponse>('/api/classify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  predictSalary: (payload: {
    job_title: string;
    job_description: string;
    skills: string;
    location: string;
    experience_level: string;
    experience_min_years: number;
    experience_max_years: number;
    job_category?: string;
  }) =>
    requestJson<SalaryPredictionResponse>('/api/predict-salary', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  clusterJob: (payload: { job_title: string; skills: string }) =>
    requestJson<ClusteringResponse>('/api/cluster', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getModelMetrics: () => requestJson<ModelMetricsResponse>('/api/model-metrics'),
  getClusters: () => requestJson<ClustersOverviewResponse>('/api/clusters'),
  getJobs: (params: {
    q?: string;
    category?: string;
    location?: string;
    experience_level?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.category) sp.set('category', params.category);
    if (params.location) sp.set('location', params.location);
    if (params.experience_level) sp.set('experience_level', params.experience_level);
    if (params.sort) sp.set('sort', params.sort);
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    return requestJson<JobsExplorerResponse>(`/api/jobs?${sp.toString()}`);
  },
};

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
