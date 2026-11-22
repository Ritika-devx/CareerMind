import { useEffect, useState } from 'react';
import { AlertCircle, Network } from 'lucide-react';
import { ClusterScatterSvg } from '../components/ClusterScatterSvg';
import { careerMindApi, formatInr } from '../services/api';
import type {
  ClusteringResponse,
  ClustersOverviewResponse,
  JobInputDraft,
} from '../types/careermind';

interface ClusteringPageProps {
  draft: JobInputDraft | null;
  onResult: (res: ClusteringResponse) => void;
  onLoadSample: () => void;
}

export function ClusteringPage({
  draft,
  onResult,
  onLoadSample,
}: ClusteringPageProps) {
  const [jobTitle, setJobTitle] = useState('Data Scientist');
  const [skills, setSkills] = useState(
    'Python, SQL, Machine Learning, Statistics, Data Analysis'
  );

  const [overview, setOverview] = useState<ClustersOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClusteringResponse | null>(null);

  useEffect(() => {
    let active = true;
    careerMindApi
      .getClusters()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load clusters.');
        }
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (draft) {
      setJobTitle(draft.job_title);
      setSkills(draft.skills);
      setError(null);
    }
  }, [draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jobTitle.trim() && !skills.trim()) {
      setError('Enter a job title or skills to assign a cluster.');
      return;
    }

    setLoading(true);
    try {
      const response = await careerMindApi.clusterJob({
        job_title: jobTitle.trim(),
        skills: skills.trim(),
      });
      setResult(response);
      onResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clustering failed.');
    } finally {
      setLoading(false);
    }
  };

  const topMixEntries = result
    ? Object.entries(result.profile.category_mix)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Job Clustering Agent</h1>
          <p className="cm-page-subtitle">
            Transforms job title and skills via the saved TF-IDF vectorizer (3,033 terms),
            2-component PCA reducer, and K-Means (K=7, Silhouette = 0.7111) to assign
            a cluster ID and look up its dataset profile.
          </p>
        </div>
        <button
          type="button"
          className="cm-btn cm-btn-secondary cm-btn-sm"
          onClick={onLoadSample}
        >
          Reset to Sample Input
        </button>
      </section>

      <div className="cm-split-layout">
        <section className="cm-card">
          <div className="cm-card-header">
            <div>
              <h2 className="cm-card-title">Assign Job to Cluster</h2>
              <p className="cm-card-desc">
                Inputs: job_title + skills (location, salary, and job_category are excluded from clustering).
              </p>
            </div>
          </div>

          <form className="cm-form" onSubmit={handleSubmit}>
            <div className="cm-field">
              <label className="cm-label" htmlFor="clu-title">
                Job Title
              </label>
              <input
                id="clu-title"
                className="cm-input"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Data Scientist"
              />
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="clu-skills">
                Skills <span className="cm-label-hint">(comma-separated)</span>
              </label>
              <textarea
                id="clu-skills"
                className="cm-textarea"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, SQL, Machine Learning, Statistics, Data Analysis"
              />
            </div>

            {error && (
              <div className="cm-alert cm-alert-error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            <div className="cm-form-actions">
              <button
                type="submit"
                className="cm-btn cm-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="cm-spinner" />
                    Projecting &amp; Clustering...
                  </>
                ) : (
                  <>
                    <Network size={16} />
                    Assign Job Cluster
                  </>
                )}
              </button>
            </div>
          </form>

          {overview && overview.cluster_centers.length > 0 && (
            <div style={{ marginTop: '22px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '10px',
                  color: 'var(--text-navy)',
                }}
              >
                PCA Cluster Centroid Map (K=7)
              </div>
              <ClusterScatterSvg
                centers={overview.cluster_centers}
                profiles={overview.clusters}
                highlightedClusterId={result?.cluster_id ?? null}
                pointCoords={result?.pca_coordinates ?? null}
                pointLabel={result ? result.submitted.job_title || 'Input Job' : undefined}
              />
            </div>
          )}
        </section>

        <section className="cm-card">
          <div className="cm-card-header">
            <div>
              <h2 className="cm-card-title">Assigned Cluster Profile</h2>
              <p className="cm-card-desc">
                Mapped directly from cluster_profiles.csv and cluster_category_mix_posthoc.csv
              </p>
            </div>
          </div>

          {!result ? (
            <div className="cm-empty-state">
              <Network size={28} strokeWidth={1.6} />
              <p>
                Submit a job title and skills to inspect the assigned K-Means
                cluster ID (0–6), PCA projection coordinates, and cluster profile.
              </p>
            </div>
          ) : (
            <div>
              <div className="cm-result-highlight">
                <div className="cm-result-kicker">Assigned K-Means Cluster</div>
                <div className="cm-result-main tabular-nums">
                  Cluster {result.cluster_id}
                </div>
                <div className="cm-meta-line">
                  <span>
                    PCA Coordinates:{' '}
                    <strong className="tabular-nums">
                      ({result.pca_coordinates[0].toFixed(4)},{' '}
                      {result.pca_coordinates[1].toFixed(4)})
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Cluster Size:{' '}
                    <strong className="tabular-nums">
                      {result.profile.job_count.toLocaleString('en-IN')} jobs
                    </strong>
                  </span>
                </div>
              </div>

              <div className="cm-divider" />

              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Cluster {result.cluster_id} Summary Profile
              </h3>
              <div className="cm-kv-list">
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Top Job Title</span>
                  <span className="cm-kv-value">{result.profile.top_job_title}</span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Top Location</span>
                  <span className="cm-kv-value">{result.profile.top_location}</span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Average Experience</span>
                  <span className="cm-kv-value tabular-nums">
                    {result.profile.average_experience.toFixed(2)} yrs
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Average Annual Salary</span>
                  <span className="cm-kv-value tabular-nums">
                    {formatInr(result.profile.average_salary_inr)}
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Most Common Category (post-hoc)</span>
                  <span className="cm-kv-value">
                    {result.profile.most_common_category}
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Common Skills</span>
                  <span className="cm-kv-value" style={{ maxWidth: '340px' }}>
                    {result.profile.common_skills}
                  </span>
                </div>
              </div>

              {topMixEntries.length > 0 && (
                <>
                  <div className="cm-divider" />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                    Top Post-Hoc Category Composition
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Descriptive distribution only; job_category was excluded during clustering.
                  </p>
                  <div className="cm-bar-list">
                    {topMixEntries.map(([cat, share]) => (
                      <div className="cm-bar-item" key={cat}>
                        <div className="cm-bar-header">
                          <span className="cm-bar-label">{cat}</span>
                          <span className="tabular-nums" style={{ fontSize: '12px' }}>
                            {(share * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="cm-bar-track">
                          <div
                            className="cm-bar-fill is-purple"
                            style={{ width: `${Math.max(4, Math.round(share * 100 * 3))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <h2 className="cm-card-title">All 7 Learned Clusters Overview</h2>
            <p className="cm-card-desc">
              Complete cluster profiles across all 6,000 dataset postings from cluster_profiles.csv.
            </p>
          </div>
        </div>

        {overviewLoading ? (
          <div className="cm-empty-state">
            <div className="cm-spinner" />
            <p>Loading cluster profiles...</p>
          </div>
        ) : overview ? (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Cluster</th>
                  <th className="is-num">Jobs</th>
                  <th>Top Job Title</th>
                  <th>Top Location</th>
                  <th className="is-num">Avg Exp</th>
                  <th className="is-num">Avg Salary (INR)</th>
                  <th>Most Common Category</th>
                  <th>Common Skills</th>
                </tr>
              </thead>
              <tbody>
                {overview.clusters.map((cluster) => (
                  <tr
                    key={cluster.cluster_id}
                    className={
                      result?.cluster_id === cluster.cluster_id ? 'is-highlighted' : ''
                    }
                  >
                    <td className="tabular-nums" style={{ fontWeight: 700 }}>
                      Cluster {cluster.cluster_id}
                    </td>
                    <td className="is-num">{cluster.job_count.toLocaleString('en-IN')}</td>
                    <td>{cluster.top_job_title}</td>
                    <td>{cluster.top_location}</td>
                    <td className="is-num">{cluster.average_experience.toFixed(2)} yrs</td>
                    <td className="is-num">{formatInr(cluster.average_salary_inr)}</td>
                    <td>{cluster.most_common_category}</td>
                    <td style={{ maxWidth: '300px', color: 'var(--text-slate)' }}>
                      {cluster.common_skills}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
