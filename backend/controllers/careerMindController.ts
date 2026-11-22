import { Request, Response, NextFunction } from 'express';
import { dataService } from '../services/dataService.ts';
import {
  mlClient,
  ML_SERVICE_URL,
  MlServiceRequestError,
  MlServiceUnavailableError,
} from '../services/mlClient.ts';

function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function handleControllerError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof MlServiceUnavailableError || err instanceof MlServiceRequestError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  next(err);
}

export async function getHealth(req: Request, res: Response): Promise<void> {
  const datasetStats = dataService.getDatasetStats();
  let mlStatus: Record<string, unknown> = {
    reachable: false,
    url: ML_SERVICE_URL,
  };

  try {
    const mlHealth = await mlClient.getHealth();
    mlStatus = {
      reachable: true,
      url: ML_SERVICE_URL,
      ...mlHealth,
    };
  } catch (err) {
    mlStatus = {
      reachable: false,
      url: ML_SERVICE_URL,
      error: err instanceof Error ? err.message : 'ML service unreachable',
    };
  }

  const healthy = Boolean(mlStatus.reachable && datasetStats.total_records > 0);
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    backend: 'careermind-express-api',
    dataset_records: datasetStats.total_records,
    ml_service: mlStatus,
  });
}

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = dataService.getDatasetStats();
    const metrics = dataService.getModelMetrics();
    let mlMetadata = null;
    try {
      mlMetadata = await mlClient.getMetadata();
    } catch {
      mlMetadata = null;
    }

    res.json({
      dataset: {
        total_records: stats.total_records,
        unique_categories: stats.unique_categories,
        unique_job_titles: stats.unique_job_titles,
        unique_locations: stats.unique_locations,
        categories: mlMetadata?.classifier?.classes ?? stats.categories,
        locations: mlMetadata?.salary?.locations ?? stats.locations,
        experience_levels:
          mlMetadata?.salary?.experience_levels ?? stats.experience_levels,
        salary_summary: stats.salary_summary,
      },
      metrics: {
        classification: metrics.classification.summary,
        salary: metrics.salary.summary,
        clustering: metrics.clustering.summary,
      },
      model_metadata: mlMetadata,
    });
  } catch (err) {
    handleControllerError(err, res, next);
  }
}

export async function classifyJob(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      job_title = '',
      job_description = '',
      skills = '',
      location = '',
      experience_midpoint_years,
    } = req.body ?? {};

    const cleanTitle = String(job_title).trim();
    const cleanDesc = String(job_description).trim();
    const cleanSkills = String(skills).trim();
    const cleanLocation = String(location).trim();

    if (!cleanTitle && !cleanDesc && !cleanSkills) {
      res.status(400).json({
        error: 'Please enter a job title, description, or skills to classify.',
      });
      return;
    }
    if (!cleanLocation) {
      res.status(400).json({ error: 'Location is required.' });
      return;
    }

    const expMid = Number(experience_midpoint_years);
    if (
      experience_midpoint_years === undefined ||
      experience_midpoint_years === null ||
      experience_midpoint_years === '' ||
      !Number.isFinite(expMid) ||
      expMid < 0 ||
      expMid > 50
    ) {
      res.status(400).json({
        error: 'Experience midpoint (years) must be a number between 0 and 50.',
      });
      return;
    }

    const mlResult = await mlClient.classify({
      job_title: cleanTitle,
      job_description: cleanDesc,
      skills: cleanSkills,
      location: cleanLocation,
      experience_midpoint_years: expMid,
    });

    res.json({
      ...mlResult,
      submitted: {
        job_title: cleanTitle,
        job_description: cleanDesc,
        skills: cleanSkills,
        location: cleanLocation,
        experience_midpoint_years: expMid,
      },
    });
  } catch (err) {
    handleControllerError(err, res, next);
  }
}

export async function predictSalary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      job_title = '',
      job_description = '',
      skills = '',
      location = '',
      experience_level = '',
      experience_min_years,
      experience_max_years,
      job_category,
    } = req.body ?? {};

    const cleanTitle = String(job_title).trim();
    const cleanDesc = String(job_description).trim();
    const cleanSkills = String(skills).trim();
    const cleanLocation = String(location).trim();
    const cleanLevel = String(experience_level).trim();
    const manualCategory =
      typeof job_category === 'string' && job_category.trim() !== ''
        ? job_category.trim()
        : null;

    if (!cleanTitle) {
      res.status(400).json({ error: 'Job title is required.' });
      return;
    }
    if (!cleanDesc) {
      res.status(400).json({ error: 'Job description is required.' });
      return;
    }
    if (!cleanSkills) {
      res.status(400).json({ error: 'Skills are required.' });
      return;
    }
    if (!cleanLocation) {
      res.status(400).json({ error: 'Location is required.' });
      return;
    }
    if (!cleanLevel) {
      res.status(400).json({ error: 'Experience level is required.' });
      return;
    }

    const expMin = Number(experience_min_years);
    const expMax = Number(experience_max_years);
    if (
      experience_min_years === undefined ||
      experience_min_years === '' ||
      !Number.isFinite(expMin) ||
      expMin < 0 ||
      expMin > 50
    ) {
      res.status(400).json({
        error: 'Minimum experience must be a valid number between 0 and 50.',
      });
      return;
    }
    if (
      experience_max_years === undefined ||
      experience_max_years === '' ||
      !Number.isFinite(expMax) ||
      expMax < 0 ||
      expMax > 50
    ) {
      res.status(400).json({
        error: 'Maximum experience must be a valid number between 0 and 50.',
      });
      return;
    }
    if (expMin > expMax) {
      res.status(400).json({
        error: 'Minimum experience cannot exceed maximum experience.',
      });
      return;
    }

    const expMid = Number(((expMin + expMax) / 2).toFixed(2));

    // Step 1: Always run Classification Agent first so we have the predicted category
    // (and decision scores), and use it unless user provided a manual override.
    const classificationResult = await mlClient.classify({
      job_title: cleanTitle,
      job_description: cleanDesc,
      skills: cleanSkills,
      location: cleanLocation,
      experience_midpoint_years: expMid,
    });

    const effectiveCategory = manualCategory ?? classificationResult.predicted_category;
    const categorySource = manualCategory ? 'manual_override' : 'predicted';

    // Step 2: Run Improved Salary Prediction Agent with all 9 exact features
    const salaryResult = await mlClient.predictSalary({
      job_title: cleanTitle,
      job_description: cleanDesc,
      skills: cleanSkills,
      job_category: effectiveCategory,
      location: cleanLocation,
      experience_level: cleanLevel,
      experience_midpoint_years: expMid,
      experience_min_years: expMin,
      experience_max_years: expMax,
    });

    res.json({
      predicted_salary_inr: salaryResult.predicted_salary_inr,
      formatted_salary_inr: formatInr(salaryResult.predicted_salary_inr),
      monthly_equivalent_inr: Math.round(salaryResult.predicted_salary_inr / 12),
      formatted_monthly_inr: formatInr(salaryResult.predicted_salary_inr / 12),
      category_source: categorySource,
      effective_job_category: effectiveCategory,
      classification_step: {
        predicted_category: classificationResult.predicted_category,
        top_decision_score: classificationResult.top_decision_score,
        decision_scores: classificationResult.decision_scores.slice(0, 5),
        supports_probabilities: false,
      },
      model_info: salaryResult.model_info,
      used_features: salaryResult.used_features,
      disclaimer:
        'Estimated annual salary in INR learned from the CareerMind synthetic academic dataset (RandomForestRegressor, Test R² = 0.8154). This is a statistical estimate, not a guaranteed offer.',
    });
  } catch (err) {
    handleControllerError(err, res, next);
  }
}

export async function clusterJob(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { job_title = '', skills = '' } = req.body ?? {};
    const cleanTitle = String(job_title).trim();
    const cleanSkills = String(skills).trim();

    if (!cleanTitle && !cleanSkills) {
      res.status(400).json({
        error: 'Please provide at least a job title or skills to assign a cluster.',
      });
      return;
    }

    const clusterResult = await mlClient.cluster({
      job_title: cleanTitle,
      skills: cleanSkills,
    });

    const profile = dataService.getClusterProfile(clusterResult.cluster_id);
    if (!profile) {
      res.status(500).json({
        error: `Cluster profile for cluster_id ${clusterResult.cluster_id} was not found in cluster_profiles.csv.`,
      });
      return;
    }

    res.json({
      ...clusterResult,
      profile,
      submitted: {
        job_title: cleanTitle,
        skills: cleanSkills,
      },
    });
  } catch (err) {
    handleControllerError(err, res, next);
  }
}

export function getModelMetrics(req: Request, res: Response): void {
  res.json(dataService.getModelMetrics());
}

export async function getClusters(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profiles = dataService.getAllClusterProfiles();
    const metrics = dataService.getModelMetrics();
    let clusterCenters: number[][] = [];
    try {
      const meta = await mlClient.getMetadata();
      clusterCenters = meta.clustering.cluster_centers;
    } catch {
      clusterCenters = [];
    }

    res.json({
      clusters: profiles,
      cluster_centers: clusterCenters,
      summary: metrics.clustering.summary,
      algorithm_comparison: metrics.clustering.algorithm_comparison,
    });
  } catch (err) {
    handleControllerError(err, res, next);
  }
}

export function getJobs(req: Request, res: Response): void {
  const overview = dataService.getDatasetStats();
  const queryResult = dataService.queryJobs({
    q: typeof req.query.q === 'string' ? req.query.q : undefined,
    category: typeof req.query.category === 'string' ? req.query.category : undefined,
    location: typeof req.query.location === 'string' ? req.query.location : undefined,
    experience_level:
      typeof req.query.experience_level === 'string'
        ? req.query.experience_level
        : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 15,
  });

  res.json({
    overview,
    ...queryResult,
  });
}
