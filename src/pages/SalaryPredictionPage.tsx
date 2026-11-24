import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';
import { careerMindApi } from '../services/api';
import type { JobInputDraft, SalaryPredictionResponse } from '../types/careermind';

interface SalaryPredictionPageProps {
  locations: string[];
  experienceLevels: string[];
  categories: string[];
  draft: JobInputDraft | null;
  onResult: (res: SalaryPredictionResponse) => void;
  onLoadSample: () => void;
}

export function SalaryPredictionPage({
  locations,
  experienceLevels,
  categories,
  draft,
  onResult,
  onLoadSample,
}: SalaryPredictionPageProps) {
  const [jobTitle, setJobTitle] = useState('Data Scientist');
  const [jobDescription, setJobDescription] = useState(
    'Builds predictive machine learning models, performs statistical analysis, and develops data-driven solutions.'
  );
  const [skills, setSkills] = useState(
    'Python, SQL, Machine Learning, Statistics, Data Analysis'
  );
  const [location, setLocation] = useState('Bengaluru');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [expMin, setExpMin] = useState('3');
  const [expMax, setExpMax] = useState('6');
  const [categoryOverride, setCategoryOverride] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryPredictionResponse | null>(null);

  useEffect(() => {
    if (draft) {
      setJobTitle(draft.job_title);
      setJobDescription(draft.job_description);
      setSkills(draft.skills);
      setLocation(draft.location);
      setExperienceLevel(draft.experience_level);
      setExpMin(String(draft.experience_min_years));
      setExpMax(String(draft.experience_max_years));
      setCategoryOverride(draft.job_category ?? '');
      setError(null);
    }
  }, [draft]);

  const minNum = Number(expMin);
  const maxNum = Number(expMax);
  const computedMidpoint =
    Number.isFinite(minNum) && Number.isFinite(maxNum)
      ? ((minNum + maxNum) / 2).toFixed(1)
      : '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jobTitle.trim() || !jobDescription.trim() || !skills.trim()) {
      setError('Job title, job description, and skills are all required.');
      return;
    }
    if (!Number.isFinite(minNum) || minNum < 0 || !Number.isFinite(maxNum) || maxNum > 50) {
      setError('Experience years must be valid numbers between 0 and 50.');
      return;
    }
    if (minNum > maxNum) {
      setError('Minimum experience cannot exceed maximum experience.');
      return;
    }

    setLoading(true);
    try {
      const response = await careerMindApi.predictSalary({
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
        skills: skills.trim(),
        location: location.trim(),
        experience_level: experienceLevel.trim(),
        experience_min_years: minNum,
        experience_max_years: maxNum,
        ...(categoryOverride ? { job_category: categoryOverride } : {}),
      });
      setResult(response);
      onResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Salary prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Salary Prediction Agent</h1>
          
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
              <h2 className="cm-card-title">Compensation Inputs (9 Model Features)</h2>
              <p className="cm-card-desc">
                Computed midpoint: <strong className="tabular-nums">{computedMidpoint} yrs</strong>
              </p>
            </div>
          </div>

          <form className="cm-form" onSubmit={handleSubmit}>
            <div className="cm-field">
              <label className="cm-label" htmlFor="sal-title">
                Job Title
              </label>
              <input
                id="sal-title"
                className="cm-input"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Data Scientist"
              />
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="sal-desc">
                Job Description
              </label>
              <textarea
                id="sal-desc"
                className="cm-textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe core engineering, analytics, or business duties..."
              />
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="sal-skills">
                Skills <span className="cm-label-hint">(comma-separated)</span>
              </label>
              <input
                id="sal-skills"
                className="cm-input"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, SQL, Machine Learning, Statistics, Data Analysis"
              />
            </div>

            <div className="cm-form-row-2">
              <div className="cm-field">
                <label className="cm-label" htmlFor="sal-loc">
                  Location
                </label>
                <select
                  id="sal-loc"
                  className="cm-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {(locations.length > 0
                    ? locations
                    : ['Bengaluru', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi']
                  ).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cm-field">
                <label className="cm-label" htmlFor="sal-level">
                  Experience Level
                </label>
                <select
                  id="sal-level"
                  className="cm-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  {(experienceLevels.length > 0
                    ? experienceLevels
                    : ['Fresher', 'Junior', 'Early Career', 'Mid Level', 'Senior', 'Lead']
                  ).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cm-form-row-2">
              <div className="cm-field">
                <label className="cm-label" htmlFor="sal-min">
                  Minimum Experience (years)
                </label>
                <input
                  id="sal-min"
                  className="cm-input tabular-nums"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={expMin}
                  onChange={(e) => setExpMin(e.target.value)}
                />
              </div>

              <div className="cm-field">
                <label className="cm-label" htmlFor="sal-max">
                  Maximum Experience (years)
                </label>
                <input
                  id="sal-max"
                  className="cm-input tabular-nums"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={expMax}
                  onChange={(e) => setExpMax(e.target.value)}
                />
              </div>
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="sal-cat">
                Job Category{' '}
                <span className="cm-label-hint">
                  (Optional manual override — leave on Auto to use Classification Agent)
                </span>
              </label>
              <select
                id="sal-cat"
                className="cm-select"
                value={categoryOverride}
                onChange={(e) => setCategoryOverride(e.target.value)}
              >
                <option value="">Auto-predict via Classification Agent</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
                className="cm-btn cm-btn-purple"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="cm-spinner" />
                    Running 2-Step Prediction...
                  </>
                ) : (
                  <>
                    <IndianRupee size={16} />
                    Predict Annual Salary
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="cm-card">
          <div className="cm-card-header">
            <div>
              <h2 className="cm-card-title">Chained Pipeline Output</h2>
            
            </div>
          </div>

          {!result ? (
            <div className="cm-empty-state">
              <IndianRupee size={28} strokeWidth={1.6} />
              <p>
                Submit a job posting to run Classification → Salary Regression and
                view the estimated annual INR salary.
              </p>
            </div>
          ) : (
            <div>
              <div className="cm-result-highlight">
                <div className="cm-result-kicker">
                  Estimated Average Annual Salary (INR)
                </div>
                <div className="cm-result-main tabular-nums">
                  {result.formatted_salary_inr}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-slate)',
                      marginLeft: '8px',
                    }}
                  >
                    / year
                  </span>
                </div>
                <div className="cm-meta-line">
                  <span>
                    Monthly equivalent:{' '}
                    <strong className="tabular-nums">
                      {result.formatted_monthly_inr} / mo
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Model: {result.model_info.algorithm}
                  </span>
                </div>
              </div>

              <div className="cm-alert cm-alert-warning" style={{ marginTop: '16px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{result.disclaimer}</span>
              </div>

              <div className="cm-divider" />

              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Two-Stage Agent Pipeline Trace
              </h3>
              <div className="cm-kv-list">
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Step 1 · Classifier Prediction</span>
                  <span className="cm-kv-value">
                    {result.classification_step.predicted_category}{' '}
                    <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      (score {result.classification_step.top_decision_score?.toFixed(3)})
                    </span>
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">
                    Step 2 · Category Passed to Salary Model
                  </span>
                  <span className="cm-kv-value" style={{ color: 'var(--accent-purple)' }}>
                    {result.effective_job_category} (
                    {result.category_source === 'manual_override'
                      ? 'Manual Override'
                      : 'Auto-Predicted'}
                    )
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Experience Range &amp; Midpoint</span>
                  <span className="cm-kv-value tabular-nums">
                    {result.used_features.experience_min_years}–
                    {result.used_features.experience_max_years} yrs (mid{' '}
                    {result.used_features.experience_midpoint_years} yrs ·{' '}
                    {String(result.used_features.experience_level)})
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Location</span>
                  <span className="cm-kv-value">
                    {String(result.used_features.location)}
                  </span>
                </div>
              </div>

              {result.category_source === 'predicted' && (
                <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-slate)' }}>
                  <ArrowRight size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  Want to test salary sensitivity across another domain? Select a
                  category in the override dropdown and resubmit.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
