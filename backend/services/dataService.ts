import fs from 'fs';
import path from 'path';

export interface JobRecord {
  job_id: string;
  job_title: string;
  job_description: string;
  skills: string;
  experience_min_years: number;
  experience_max_years: number;
  experience_midpoint_years: number;
  experience_level: string;
  location: string;
  job_category: string;
  minimum_annual_salary_inr: number;
  maximum_annual_salary_inr: number;
  average_annual_salary_inr: number;
  currency: string;
  salary_period: string;
}

export interface ClusterProfile {
  cluster_id: number;
  job_count: number;
  top_job_title: string;
  top_location: string;
  average_experience: number;
  average_salary_inr: number;
  most_common_category: string;
  common_skills: string;
  skills_list: string[];
  category_mix: Record<string, number>;
}

const PROJECT_ROOT = process.cwd();

function resolveDataFile(preferredRelative: string, aistudioFilename: string): string {
  const candidates = [
    path.join(PROJECT_ROOT, preferredRelative),
    path.join(PROJECT_ROOT, 'public', 'assets', 'aistudio', aistudioFilename),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `Required data file not found. Checked: ${candidates.join(', ')}`
  );
}

/**
 * RFC-4180 compliant CSV parser handling quoted values, embedded commas, and CRLF.
 */
function parseCsvRecords(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField);
      currentField = '';
    } else if (ch === '\r' && next === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const nonEmptyRows = rows.filter(
    (row) => row.length > 1 || (row.length === 1 && row[0].trim() !== '')
  );
  if (nonEmptyRows.length === 0) return [];

  const headers = nonEmptyRows[0].map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let r = 1; r < nonEmptyRows.length; r++) {
    const row = nonEmptyRows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (row[c] ?? '').trim();
    }
    records.push(obj);
  }
  return records;
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function toNum(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

class CareerMindDataService {
  private jobs: JobRecord[] = [];
  private datasetColumns: string[] = [];
  private clusterProfiles: ClusterProfile[] = [];
  private classificationComparison: Record<string, string | number>[] = [];
  private classificationSummary: Record<string, unknown> = {};
  private salaryComparisonImproved: Record<string, string | number>[] = [];
  private salaryComparisonBaseline: Record<string, string | number>[] = [];
  private salarySummary: Record<string, unknown> = {};
  private algorithmComparison: Record<string, string | number>[] = [];
  private kmeansExperiments: Record<string, string | number>[] = [];
  private hierarchicalExperiments: Record<string, string | number>[] = [];
  private dbscanExperiments: Record<string, string | number | null>[] = [];
  private clusteringSummary: Record<string, unknown> = {};
  private initialized = false;

  public init(): void {
    if (this.initialized) return;

    const datasetPath = resolveDataFile(
      'data/master_dataset.csv',
      'careermind_master_dataset_v2_0b210487.csv'
    );
    const rawJobs = parseCsvRecords(datasetPath);
    if (rawJobs.length > 0) {
      this.datasetColumns = Object.keys(rawJobs[0]);
    }
    this.jobs = rawJobs.map((row) => ({
      job_id: row.job_id,
      job_title: row.job_title,
      job_description: row.job_description,
      skills: row.skills,
      experience_min_years: toNum(row.experience_min_years),
      experience_max_years: toNum(row.experience_max_years),
      experience_midpoint_years: toNum(row.experience_midpoint_years),
      experience_level: row.experience_level,
      location: row.location,
      job_category: row.job_category,
      minimum_annual_salary_inr: toNum(row.minimum_annual_salary_inr),
      maximum_annual_salary_inr: toNum(row.maximum_annual_salary_inr),
      average_annual_salary_inr: toNum(row.average_annual_salary_inr),
      currency: row.currency,
      salary_period: row.salary_period,
    }));

    this.classificationComparison = parseCsvRecords(
      resolveDataFile(
        'data/results/classification_model_comparison.csv',
        'classification_model_comparison_9ca81fce.csv'
      )
    ).map((r) => ({
      Model: r.Model,
      Accuracy: toNum(r.Accuracy),
      Precision_macro: toNum(r.Precision_macro),
      Recall_macro: toNum(r.Recall_macro),
      F1_macro: toNum(r.F1_macro),
    }));

    this.classificationSummary = readJsonFile<Record<string, unknown>>(
      resolveDataFile(
        'data/results/classification_summary.json',
        'classification_summary_b5bfae97.json'
      )
    );

    this.salaryComparisonImproved = parseCsvRecords(
      resolveDataFile(
        'data/results/salary_model_comparison_improved.csv',
        'salary_model_comparison_improved_35ca96bd.csv'
      )
    ).map((r) => ({
      Model: r.Model,
      Train_R2: toNum(r['Train R2']),
      Test_R2: toNum(r['Test R2']),
      Test_MAE: toNum(r['Test MAE']),
      Test_RMSE: toNum(r['Test RMSE']),
    }));

    this.salaryComparisonBaseline = parseCsvRecords(
      resolveDataFile(
        'data/results/salary_model_comparison.csv',
        'salary_model_comparison_a74a72f5.csv'
      )
    ).map((r) => ({
      Model: r.Model,
      MAE_INR: toNum(r.MAE_INR),
      MSE_INR2: toNum(r.MSE_INR2),
      RMSE_INR: toNum(r.RMSE_INR),
      R2: toNum(r.R2),
    }));

    this.salarySummary = readJsonFile<Record<string, unknown>>(
      resolveDataFile(
        'data/results/salary_summary.json',
        'salary_summary_7d7978ff.json'
      )
    );

    const rawProfiles = parseCsvRecords(
      resolveDataFile(
        'data/results/cluster_profiles.csv',
        'cluster_profiles_0ef8d245.csv'
      )
    );
    const rawMix = parseCsvRecords(
      resolveDataFile(
        'data/results/cluster_category_mix_posthoc.csv',
        'cluster_category_mix_posthoc_878bcd4b.csv'
      )
    );

    const mixByCluster = new Map<number, Record<string, number>>();
    for (const row of rawMix) {
      const cid = toNum(row.cluster_id);
      const proportions: Record<string, number> = {};
      for (const [key, val] of Object.entries(row)) {
        if (key !== 'cluster_id') {
          proportions[key] = toNum(val);
        }
      }
      mixByCluster.set(cid, proportions);
    }

    this.clusterProfiles = rawProfiles
      .map((row) => {
        const clusterId = toNum(row.cluster_id);
        return {
          cluster_id: clusterId,
          job_count: toNum(row.job_count),
          top_job_title: row.top_job_title,
          top_location: row.top_location,
          average_experience: toNum(row.average_experience),
          average_salary_inr: toNum(row.average_salary_inr),
          most_common_category: row.most_common_category,
          common_skills: row.common_skills,
          skills_list: row.common_skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          category_mix: mixByCluster.get(clusterId) ?? {},
        };
      })
      .sort((a, b) => a.cluster_id - b.cluster_id);

    this.algorithmComparison = parseCsvRecords(
      resolveDataFile(
        'data/results/algorithm_comparison.csv',
        'algorithm_comparison_d33855f7.csv'
      )
    ).map((r) => ({
      Algorithm: r.Algorithm,
      Parameters: r.Parameters,
      Clusters: toNum(r.Clusters),
      Silhouette: toNum(r.Silhouette),
      Noise_points: toNum(r['Noise points']),
      Coverage: toNum(r.Coverage),
    }));

    this.kmeansExperiments = parseCsvRecords(
      resolveDataFile(
        'data/results/kmeans_experiments.csv',
        'kmeans_experiments_0dc9c902.csv'
      )
    ).map((r) => ({
      Features: r.Features,
      PCA_components: toNum(r['PCA components']),
      K: toNum(r.K),
      Clusters: toNum(r.Clusters),
      Silhouette: toNum(r.Silhouette),
      Coverage: toNum(r.Coverage),
    }));

    this.hierarchicalExperiments = parseCsvRecords(
      resolveDataFile(
        'data/results/hierarchical_experiments.csv',
        'hierarchical_experiments_107b82e6.csv'
      )
    ).map((r) => ({
      Algorithm: r.Algorithm,
      Parameters: r.Parameters,
      Clusters: toNum(r.Clusters),
      Silhouette: toNum(r.Silhouette),
      Noise_points: toNum(r['Noise points']),
      Coverage: toNum(r.Coverage),
    }));

    this.dbscanExperiments = parseCsvRecords(
      resolveDataFile(
        'data/results/dbscan_experiments.csv',
        'dbscan_experiments_8fcc192a.csv'
      )
    ).map((r) => ({
      Algorithm: r.Algorithm,
      Parameters: r.Parameters,
      Clusters: toNum(r.Clusters),
      Silhouette: r.Silhouette === '' ? null : toNum(r.Silhouette),
      Noise_points: toNum(r['Noise points']),
      Coverage: toNum(r.Coverage),
    }));

    this.clusteringSummary = readJsonFile<Record<string, unknown>>(
      resolveDataFile(
        'data/results/clustering_summary.json',
        'clustering_summary_1261e043.json'
      )
    );

    this.initialized = true;
  }

  public getDatasetStats() {
    this.init();
    const categoryCounts = new Map<string, number>();
    const titleCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const levelCounts = new Map<string, number>();

    let salarySum = 0;
    let minSalary = Infinity;
    let maxSalary = -Infinity;

    for (const job of this.jobs) {
      categoryCounts.set(job.job_category, (categoryCounts.get(job.job_category) ?? 0) + 1);
      titleCounts.set(job.job_title, (titleCounts.get(job.job_title) ?? 0) + 1);
      locationCounts.set(job.location, (locationCounts.get(job.location) ?? 0) + 1);
      levelCounts.set(job.experience_level, (levelCounts.get(job.experience_level) ?? 0) + 1);
      salarySum += job.average_annual_salary_inr;
      if (job.average_annual_salary_inr < minSalary) minSalary = job.average_annual_salary_inr;
      if (job.average_annual_salary_inr > maxSalary) maxSalary = job.average_annual_salary_inr;
    }

    const sortEntries = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
      total_records: this.jobs.length,
      columns: this.datasetColumns,
      unique_categories: categoryCounts.size,
      unique_job_titles: titleCounts.size,
      unique_locations: locationCounts.size,
      unique_experience_levels: levelCounts.size,
      categories: Array.from(categoryCounts.keys()).sort(),
      locations: Array.from(locationCounts.keys()).sort(),
      experience_levels: ['Fresher', 'Junior', 'Early Career', 'Mid Level', 'Senior', 'Lead'].filter(
        (lvl) => levelCounts.has(lvl)
      ),
      salary_summary: {
        mean_inr: this.jobs.length ? Math.round(salarySum / this.jobs.length) : 0,
        min_inr: Number.isFinite(minSalary) ? minSalary : 0,
        max_inr: Number.isFinite(maxSalary) ? maxSalary : 0,
      },
      distributions: {
        by_category: sortEntries(categoryCounts),
        by_title_top_15: sortEntries(titleCounts).slice(0, 15),
        by_location: sortEntries(locationCounts),
        by_experience_level: sortEntries(levelCounts),
      },
    };
  }

  public queryJobs(params: {
    q?: string;
    category?: string;
    location?: string;
    experience_level?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    this.init();
    const q = (params.q ?? '').trim().toLowerCase();
    const category = (params.category ?? '').trim();
    const location = (params.location ?? '').trim();
    const expLevel = (params.experience_level ?? '').trim();
    const sort = params.sort ?? 'default';
    const page = Math.max(1, Number(params.page ?? 1) || 1);
    const limit = Math.min(50, Math.max(5, Number(params.limit ?? 15) || 15));

    let filtered = this.jobs.filter((job) => {
      if (category && job.job_category !== category) return false;
      if (location && job.location !== location) return false;
      if (expLevel && job.experience_level !== expLevel) return false;
      if (q) {
        const hay = `${job.job_id} ${job.job_title} ${job.skills} ${job.job_description} ${job.job_category} ${job.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sort === 'salary_desc') {
      filtered = [...filtered].sort((a, b) => b.average_annual_salary_inr - a.average_annual_salary_inr);
    } else if (sort === 'salary_asc') {
      filtered = [...filtered].sort((a, b) => a.average_annual_salary_inr - b.average_annual_salary_inr);
    } else if (sort === 'exp_desc') {
      filtered = [...filtered].sort((a, b) => b.experience_midpoint_years - a.experience_midpoint_years);
    } else if (sort === 'exp_asc') {
      filtered = [...filtered].sort((a, b) => a.experience_midpoint_years - b.experience_midpoint_years);
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      total_filtered: totalFiltered,
      page: safePage,
      limit,
      total_pages: totalPages,
      items,
    };
  }

  public getClusterProfile(clusterId: number): ClusterProfile | null {
    this.init();
    return this.clusterProfiles.find((c) => c.cluster_id === clusterId) ?? null;
  }

  public getAllClusterProfiles(): ClusterProfile[] {
    this.init();
    return this.clusterProfiles;
  }

  public getModelMetrics() {
    this.init();
    return {
      classification: {
        summary: this.classificationSummary,
        comparison: this.classificationComparison,
      },
      salary: {
        summary: this.salarySummary,
        comparison_improved: this.salaryComparisonImproved,
        comparison_baseline: this.salaryComparisonBaseline,
      },
      clustering: {
        summary: this.clusteringSummary,
        algorithm_comparison: this.algorithmComparison,
        kmeans_experiments: this.kmeansExperiments,
        hierarchical_experiments: this.hierarchicalExperiments,
        dbscan_experiments: this.dbscanExperiments,
      },
    };
  }
}

export const dataService = new CareerMindDataService();
