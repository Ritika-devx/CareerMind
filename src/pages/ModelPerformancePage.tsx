import { useEffect, useState } from 'react';
import { careerMindApi, formatInr } from '../services/api';
import type { ModelMetricsResponse } from '../types/careermind';

export function ModelPerformancePage() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salaryView, setSalaryView] = useState<'improved' | 'baseline'>('improved');

  useEffect(() => {
    let active = true;
    careerMindApi
      .getModelMetrics()
      .then((data) => {
        if (active) setMetrics(data);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load model metrics.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="cm-card">
        <div className="cm-empty-state">
          <div className="cm-spinner" />
          <p>Loading evaluation results from summary JSON and comparison CSV files...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="cm-alert cm-alert-error">
        <span>Unable to load evaluation metrics: {error ?? 'Unknown error'}</span>
      </div>
    );
  }

  const clf = metrics.classification;
  const sal = metrics.salary;
  const clu = metrics.clustering;

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Model Evaluation &amp; Comparison</h1>
         
        </div>
      </section>

      {/* Classification Section */}
      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <div className="cm-result-kicker">Agent 01 · Classification</div>
            <h2 className="cm-card-title">
              Job Classification — {clf.summary.selected_model}
            </h2>
            <p className="cm-card-desc">
              Selection rule: {clf.summary.selection_metric} · Held-out 20% stratified test split
            </p>
          </div>
        </div>

        <div className="cm-kpi-grid" style={{ marginBottom: '22px' }}>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Test Accuracy</div>
            <div className="cm-kpi-value tabular-nums">
              {(clf.summary.test_metrics.Accuracy * 100).toFixed(2)}%
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Macro F1-Score</div>
            <div className="cm-kpi-value tabular-nums">
              {(clf.summary.test_metrics.F1_macro * 100).toFixed(2)}%
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">5-Fold CV Macro F1</div>
            <div className="cm-kpi-value tabular-nums">
              {(clf.summary.cross_validation_macro_f1_mean * 100).toFixed(2)}%
            </div>
            <div className="cm-kpi-note tabular-nums">
              Std ±{(clf.summary.cross_validation_macro_f1_std * 100).toFixed(2)}%
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Macro Precision / Recall</div>
            <div className="cm-kpi-value tabular-nums">
              {(clf.summary.test_metrics.Precision_macro * 100).toFixed(2)}%
            </div>
            <div className="cm-kpi-note tabular-nums">
              Recall {(clf.summary.test_metrics.Recall_macro * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="cm-grid-2">
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th className="is-num">Accuracy</th>
                  <th className="is-num">Precision</th>
                  <th className="is-num">Recall</th>
                  <th className="is-num">Macro F1</th>
                </tr>
              </thead>
              <tbody>
                {clf.comparison.map((row) => (
                  <tr
                    key={row.Model}
                    className={
                      row.Model === clf.summary.selected_model ? 'is-highlighted' : ''
                    }
                  >
                    <td style={{ fontWeight: row.Model === clf.summary.selected_model ? 700 : 500 }}>
                      {row.Model}
                    </td>
                    <td className="is-num">{(row.Accuracy * 100).toFixed(2)}%</td>
                    <td className="is-num">{(row.Precision_macro * 100).toFixed(2)}%</td>
                    <td className="is-num">{(row.Recall_macro * 100).toFixed(2)}%</td>
                    <td className="is-num">{(row.F1_macro * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Macro F1 Comparison Across Classifiers
            </h3>
            <div className="cm-bar-list">
              {clf.comparison.map((row, idx) => (
                <div className="cm-bar-item" key={row.Model}>
                  <div className="cm-bar-header">
                    <span className="cm-bar-label">{row.Model}</span>
                    <span className="tabular-nums" style={{ fontSize: '12px' }}>
                      {(row.F1_macro * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="cm-bar-track">
                    <div
                      className={`cm-bar-fill ${idx === 0 ? '' : 'is-muted'}`}
                      style={{ width: `${Math.round(row.F1_macro * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Salary Prediction Section */}
      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <div className="cm-result-kicker">Agent 02 · Regression</div>
            <h2 className="cm-card-title">
              Salary Prediction — {sal.summary.selected_model} (Improved 9-Feature Pipeline)
            </h2>
            <p className="cm-card-desc">
              Target: {sal.summary.target} ({sal.summary.target_unit}) · Active artifact: salary_random_forest_candidate.joblib
            </p>
          </div>
          <div className="cm-tabs" role="tablist" aria-label="Salary comparison table version">
            <button
              type="button"
              role="tab"
              aria-selected={salaryView === 'improved'}
              className={`cm-tab-btn ${salaryView === 'improved' ? 'is-active' : ''}`}
              onClick={() => setSalaryView('improved')}
            >
              Improved Models (Active)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={salaryView === 'baseline'}
              className={`cm-tab-btn ${salaryView === 'baseline' ? 'is-active' : ''}`}
              onClick={() => setSalaryView('baseline')}
            >
              Baseline Comparison
            </button>
          </div>
        </div>

        <div className="cm-kpi-grid" style={{ marginBottom: '22px' }}>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Test R² (Explained Variance)</div>
            <div className="cm-kpi-value tabular-nums">
              {sal.summary.test_r2.toFixed(6)}
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Test MAE (INR)</div>
            <div className="cm-kpi-value tabular-nums">
              {formatInr(sal.summary.test_mae_inr)}
            </div>
            <div className="cm-kpi-note tabular-nums">
              Exact ₹{sal.summary.test_mae_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Test RMSE (INR)</div>
            <div className="cm-kpi-value tabular-nums">
              {formatInr(sal.summary.test_rmse_inr)}
            </div>
            <div className="cm-kpi-note tabular-nums">
              Exact ₹{sal.summary.test_rmse_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Gain Over Baseline R²</div>
            <div className="cm-kpi-value tabular-nums">
              +0.1535
            </div>
            <div className="cm-kpi-note">0.6619 baseline → 0.8154 improved</div>
          </div>
        </div>

        {salaryView === 'improved' ? (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th className="is-num">Train R²</th>
                  <th className="is-num">Test R²</th>
                  <th className="is-num">Test MAE (INR)</th>
                  <th className="is-num">Test RMSE (INR)</th>
                </tr>
              </thead>
              <tbody>
                {sal.comparison_improved.map((row) => (
                  <tr
                    key={row.Model}
                    className={
                      row.Model === sal.summary.selected_model ? 'is-highlighted' : ''
                    }
                  >
                    <td style={{ fontWeight: row.Model === sal.summary.selected_model ? 700 : 500 }}>
                      {row.Model}
                    </td>
                    <td className="is-num">{row.Train_R2.toFixed(4)}</td>
                    <td className="is-num">{row.Test_R2.toFixed(6)}</td>
                    <td className="is-num">{formatInr(row.Test_MAE)}</td>
                    <td className="is-num">{formatInr(row.Test_RMSE)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Baseline Model (6-Feature Pipeline)</th>
                  <th className="is-num">Test R²</th>
                  <th className="is-num">MAE (INR)</th>
                  <th className="is-num">RMSE (INR)</th>
                </tr>
              </thead>
              <tbody>
                {sal.comparison_baseline.map((row) => (
                  <tr key={row.Model}>
                    <td style={{ fontWeight: 500 }}>{row.Model}</td>
                    <td className="is-num">{row.R2.toFixed(4)}</td>
                    <td className="is-num">{formatInr(row.MAE_INR)}</td>
                    <td className="is-num">{formatInr(row.RMSE_INR)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Clustering Section */}
      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <div className="cm-result-kicker">Agent 03 · Unsupervised Clustering</div>
            <h2 className="cm-card-title">
              Job Clustering — {clu.summary.deployable_model} (K={clu.summary.selected_k}, PCA={clu.summary.pca_components})
            </h2>
            <p className="cm-card-desc">
              {clu.summary.label_usage}
            </p>
          </div>
        </div>

        <div className="cm-kpi-grid" style={{ marginBottom: '22px' }}>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Full-Dataset Silhouette</div>
            <div className="cm-kpi-value tabular-nums">
              {clu.summary.silhouette_full_dataset.toFixed(4)}
            </div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Selected Clusters (K)</div>
            <div className="cm-kpi-value tabular-nums">{clu.summary.selected_k}</div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">PCA Components</div>
            <div className="cm-kpi-value tabular-nums">{clu.summary.pca_components}</div>
          </div>
          <div className="cm-kpi-card">
            <div className="cm-kpi-label">Dataset Coverage</div>
            <div className="cm-kpi-value tabular-nums">
              {(clu.summary.coverage * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="cm-grid-2">
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Algorithm Comparison (2,500-Row Shared Evaluation Sample)
            </h3>
            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Params</th>
                    <th className="is-num">Clusters</th>
                    <th className="is-num">Silhouette</th>
                    <th className="is-num">Noise</th>
                    <th className="is-num">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {clu.algorithm_comparison.map((row) => (
                    <tr
                      key={row.Algorithm}
                      className={row.Algorithm === 'K-Means' ? 'is-highlighted' : ''}
                    >
                      <td style={{ fontWeight: row.Algorithm === 'K-Means' ? 700 : 500 }}>
                        {row.Algorithm}
                      </td>
                      <td>{row.Parameters}</td>
                      <td className="is-num">{row.Clusters}</td>
                      <td className="is-num">{row.Silhouette.toFixed(4)}</td>
                      <td className="is-num">{row.Noise_points}</td>
                      <td className="is-num">{(row.Coverage * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              K-Means PCA &amp; K Tuning Grid (Top Configurations)
            </h3>
            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th className="is-num">PCA Dims</th>
                    <th className="is-num">K</th>
                    <th className="is-num">Silhouette</th>
                    <th className="is-num">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {clu.kmeans_experiments.slice(0, 6).map((row) => (
                    <tr
                      key={`${row.PCA_components}-${row.K}`}
                      className={
                        row.PCA_components === 2 && row.K === 7 ? 'is-highlighted' : ''
                      }
                    >
                      <td className="is-num">{row.PCA_components}</td>
                      <td className="is-num">{row.K}</td>
                      <td className="is-num">{row.Silhouette.toFixed(4)}</td>
                      <td className="is-num">{(row.Coverage * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
