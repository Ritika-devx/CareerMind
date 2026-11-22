import { Router } from 'express';
import {
  getHealth,
  getDashboard,
  classifyJob,
  predictSalary,
  clusterJob,
  getModelMetrics,
  getClusters,
  getJobs,
} from '../controllers/careerMindController.ts';

const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.get('/dashboard', getDashboard);
apiRouter.post('/classify', classifyJob);
apiRouter.post('/predict-salary', predictSalary);
apiRouter.post('/cluster', clusterJob);
apiRouter.get('/model-metrics', getModelMetrics);
apiRouter.get('/clusters', getClusters);
apiRouter.get('/jobs', getJobs);

export default apiRouter;
