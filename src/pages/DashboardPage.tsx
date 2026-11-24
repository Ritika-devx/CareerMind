import { ArrowRight, Briefcase, IndianRupee, Network, Trash2 } from 'lucide-react';
import { formatInr } from '../services/api';
import type { DashboardData, PageId, RecentPredictionItem } from '../types/careermind';

interface DashboardPageProps {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  onNavigate: (page: PageId) => void;
  recentPredictions: RecentPredictionItem[];
  onClearRecent: () => void;
}

export function DashboardPage({
  data,
  loading,
  error,
  onNavigate,
  recentPredictions,
  onClearRecent,
}: DashboardPageProps) {
  if (loading) {
    return (
      <div className="cm-card">
        <div className="cm-empty-state">
          <div className="cm-spinner" />
          <p>Loading CareerMind models, dataset summary, and evaluation metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="cm-alert cm-alert-error">
        <span>Unable to load dashboard data: {error ?? 'Unknown error'}</span>
      </div>
    );
  }

  const clfMetrics = data.metrics.classification;
  const salMetrics = data.metrics.salary;
  const cluMetrics = data.metrics.clustering;

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">CareerMind Job Market Intelligence</h1>
         
          <div className="cm-meta-line">
            <span>{data.dataset.unique_categories} Job Categories</span>
            <span aria-hidden="true">·</span>
            <span>{data.dataset.unique_job_titles} Unique Job Titles</span>
            <span aria-hidden="true">·</span>
            <span>{data.dataset.unique_locations} Locations</span>
            <span aria-hidden="true">·</span>
            <span>3 Trained scikit-learn Models</span>
          </div>
        </div>
        <button
          type="button"
          className="cm-btn cm-btn-secondary"
          onClick={() => onNavigate('performance')}
        >
          View Evaluation Tables
          <ArrowRight size={15} />
        </button>
      </section>

      <section className="cm-kpi-grid" aria-label="Dataset and model summary metrics">
        <div className="cm-kpi-card">
          <div className="cm-kpi-label">Total Dataset Records</div>
          <div className="cm-kpi-value tabular-nums">
            {data.dataset.total_records.toLocaleString('en-IN')}
          </div>
          <div className="cm-kpi-note">
            Verified from careermind_master_dataset_v2.csv
          </div>
        </div>
        <div className="cm-kpi-card">
          <div className="cm-kpi-label">Job Categories</div>
          <div className="cm-kpi-value tabular-nums">
            {data.dataset.unique_categories}
          </div>
          <div className="cm-kpi-note">
            Balanced 500 records per category
          </div>
        </div>
        <div className="cm-kpi-card">
          <div className="cm-kpi-label">Mean Annual Salary</div>
          <div className="cm-kpi-value tabular-nums">
            {formatInr(data.dataset.salary_summary.mean_inr)}
          </div>
          <div className="cm-kpi-note">
            Range {formatInr(data.dataset.salary_summary.min_inr)} –{' '}
            {formatInr(data.dataset.salary_summary.max_inr)}
          </div>
        </div>
        <div className="cm-kpi-card">
          <div className="cm-kpi-label">Best Salary Model R²</div>
          <div className="cm-kpi-value tabular-nums">
            {salMetrics.test_r2.toFixed(4)}
          </div>
          <div className="cm-kpi-note">
            MAE {formatInr(salMetrics.test_mae_inr)} (Test Set)
          </div>
        </div>
      </section>

      <section aria-label="Three machine learning agents">
        <div className="cm-grid-3">
          <article className="cm-card cm-agent-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div className="cm-agent-icon is-blue">
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="cm-result-kicker">Agent 01 · Classification</div>
                  <h2 className="cm-card-title">Job Classification Agent</h2>
                </div>
              </div>
            
            </div>

            <div>
              <div className="cm-metric-row">
                <div>
                  <div className="cm-metric-label">Test Accuracy</div>
                  <div className="cm-metric-val tabular-nums">
                    {(clfMetrics.test_metrics.Accuracy * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="cm-metric-label">Macro F1 (5-Fold CV)</div>
                  <div className="cm-metric-val tabular-nums">
                    {(clfMetrics.test_metrics.F1_macro * 100).toFixed(2)}% (
                    {(clfMetrics.cross_validation_macro_f1_mean * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => onNavigate('classification')}
                >
                  Open Classifier
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </article>

          <article className="cm-card cm-agent-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div className="cm-agent-icon is-purple">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <div className="cm-result-kicker">Agent 02 · Regression</div>
                  <h2 className="cm-card-title">Salary Prediction Agent</h2>
                </div>
              </div>
            
            </div>

            <div>
              <div className="cm-metric-row">
                <div>
                  <div className="cm-metric-label">Test R² Score</div>
                  <div className="cm-metric-val tabular-nums">
                    {salMetrics.test_r2.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="cm-metric-label">Test MAE / RMSE</div>
                  <div className="cm-metric-val tabular-nums">
                    {formatInr(salMetrics.test_mae_inr)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-purple"
                  style={{ width: '100%' }}
                  onClick={() => onNavigate('salary')}
                >
                  Predict Salary
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </article>

          <article className="cm-card cm-agent-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div className="cm-agent-icon is-blue">
                  <Network size={20} />
                </div>
                <div>
                  <div className="cm-result-kicker">Agent 03 · Clustering</div>
                  <h2 className="cm-card-title">Job Clustering Agent</h2>
                </div>
              </div>
             
            </div>

            <div>
              <div className="cm-metric-row">
                <div>
                  <div className="cm-metric-label">Silhouette Score</div>
                  <div className="cm-metric-val tabular-nums">
                    {cluMetrics.silhouette_full_dataset.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="cm-metric-label">Clusters / Coverage</div>
                  <div className="cm-metric-val tabular-nums">
                    K={cluMetrics.selected_k} · {(cluMetrics.coverage * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => onNavigate('clustering')}
                >
                  Explore Clusters
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <h2 className="cm-card-title">Recent Session Predictions</h2>
            <p className="cm-card-desc">
              Temporary in-browser log of live inferences executed during this session.
            </p>
          </div>
          {recentPredictions.length > 0 && (
            <button
              type="button"
              className="cm-btn cm-btn-secondary cm-btn-sm"
              onClick={onClearRecent}
            >
              <Trash2 size={14} />
              Clear History
            </button>
          )}
        </div>

        {recentPredictions.length === 0 ? (
          <div className="cm-empty-state">
            <p>
              No predictions have been run yet in this session. Test any of the
              three agents to see live results recorded here.
            </p>
            <button
              type="button"
              className="cm-btn cm-btn-primary cm-btn-sm"
              onClick={() => onNavigate('salary')}
            >
              Run First Prediction
            </button>
          </div>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Job Input</th>
                  <th>Prediction Output</th>
                  <th>Details</th>
                  <th className="is-num">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {item.agent}
                    </td>
                    <td>{item.title}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>
                      {item.summary}
                    </td>
                    <td style={{ color: 'var(--text-slate)' }}>{item.meta}</td>
                    <td className="is-num" style={{ color: 'var(--text-muted)' }}>
                      {item.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
