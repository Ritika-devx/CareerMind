import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { ClassificationPage } from './pages/ClassificationPage';
import { SalaryPredictionPage } from './pages/SalaryPredictionPage';
import { ClusteringPage } from './pages/ClusteringPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { careerMindApi } from './services/api';
import type {
  ClassificationResponse,
  ClusteringResponse,
  DashboardData,
  JobInputDraft,
  JobRecord,
  PageId,
  RecentPredictionItem,
  SalaryPredictionResponse,
} from './types/careermind';

const SAMPLE_DRAFT: JobInputDraft = {
  job_title: 'Data Scientist',
  job_description:
    'Builds predictive machine learning models, performs statistical analysis, and develops data-driven solutions.',
  skills: 'Python, SQL, Machine Learning, Statistics, Data Analysis',
  location: 'Bengaluru',
  experience_level: 'Mid Level',
  experience_min_years: 3,
  experience_max_years: 6,
  experience_midpoint_years: 4.5,
  job_category: '',
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState<string | null>(null);

  const [draft, setDraft] = useState<JobInputDraft | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<RecentPredictionItem[]>([]);

  useEffect(() => {
    let active = true;
    careerMindApi
      .getDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) {
          setDashError(err instanceof Error ? err.message : 'Failed to load dashboard.');
        }
      })
      .finally(() => {
        if (active) setDashLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pushRecent = (item: Omit<RecentPredictionItem, 'id' | 'timestamp'>) => {
    const entry: RecentPredictionItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    setRecentPredictions((prev) => [entry, ...prev].slice(0, 12));
  };

  const handleClassificationResult = (res: ClassificationResponse) => {
    pushRecent({
      agent: 'classification',
      title: res.submitted.job_title || 'Job Profile',
      summary: res.predicted_category,
      meta: `${res.submitted.location} · ${res.submitted.experience_midpoint_years} yrs · score ${res.top_decision_score?.toFixed(2) ?? '—'}`,
    });
  };

  const handleSalaryResult = (res: SalaryPredictionResponse) => {
    pushRecent({
      agent: 'salary',
      title: String(res.used_features.job_title ?? 'Job Profile'),
      summary: `${res.formatted_salary_inr} / yr`,
      meta: `${res.effective_job_category} (${res.category_source === 'manual_override' ? 'manual' : 'predicted'}) · ${String(res.used_features.location)}`,
    });
  };

  const handleClusteringResult = (res: ClusteringResponse) => {
    pushRecent({
      agent: 'clustering',
      title: res.submitted.job_title || 'Job Profile',
      summary: `Cluster ${res.cluster_id}`,
      meta: `Top: ${res.profile.top_job_title} · ${res.profile.most_common_category}`,
    });
  };

  const handleLoadSample = () => {
    setDraft({ ...SAMPLE_DRAFT });
  };

  const handleSendJobToAgent = (job: JobRecord, target: PageId) => {
    setDraft({
      job_title: job.job_title,
      job_description: job.job_description,
      skills: job.skills,
      location: job.location,
      experience_level: job.experience_level,
      experience_min_years: job.experience_min_years,
      experience_max_years: job.experience_max_years,
      experience_midpoint_years: job.experience_midpoint_years,
      job_category: '',
    });
    setActivePage(target);
  };

  const handleTopBarQuickAction = () => {
    if (activePage === 'dashboard') {
      setActivePage('salary');
    } else if (activePage === 'performance') {
      setActivePage('explorer');
    } else if (activePage === 'explorer') {
      setActivePage('classification');
    } else {
      handleLoadSample();
    }
  };

  const locations = dashboard?.dataset.locations ?? [];
  const experienceLevels = dashboard?.dataset.experience_levels ?? [];
  const categories = dashboard?.dataset.categories ?? [];

  return (
    <div className="cm-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="cm-main">
        <TopBar
          activePage={activePage}
          onOpenMobile={() => setMobileOpen(true)}
          onQuickAction={handleTopBarQuickAction}
        />

        <main className="cm-content">
          {activePage === 'dashboard' && (
            <DashboardPage
              data={dashboard}
              loading={dashLoading}
              error={dashError}
              onNavigate={setActivePage}
              recentPredictions={recentPredictions}
              onClearRecent={() => setRecentPredictions([])}
            />
          )}

          {activePage === 'classification' && (
            <ClassificationPage
              locations={locations}
              draft={draft}
              onResult={handleClassificationResult}
              onLoadSample={handleLoadSample}
            />
          )}

          {activePage === 'salary' && (
            <SalaryPredictionPage
              locations={locations}
              experienceLevels={experienceLevels}
              categories={categories}
              draft={draft}
              onResult={handleSalaryResult}
              onLoadSample={handleLoadSample}
            />
          )}

          {activePage === 'clustering' && (
            <ClusteringPage
              draft={draft}
              onResult={handleClusteringResult}
              onLoadSample={handleLoadSample}
            />
          )}

          {activePage === 'performance' && <ModelPerformancePage />}

          {activePage === 'explorer' && (
            <DatasetExplorerPage onSendJobToAgent={handleSendJobToAgent} />
          )}
        </main>
      </div>
    </div>
  );
}
