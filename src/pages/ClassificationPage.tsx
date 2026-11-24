import { useEffect, useState } from 'react';
import { AlertCircle, Briefcase, Info } from 'lucide-react';
import { careerMindApi } from '../services/api';
import type { ClassificationResponse, JobInputDraft } from '../types/careermind';

interface ClassificationPageProps {
  locations: string[];
  draft: JobInputDraft | null;
  onResult: (res: ClassificationResponse) => void;
  onLoadSample: () => void;
}

export function ClassificationPage({
  locations,
  draft,
  onResult,
  onLoadSample,
}: ClassificationPageProps) {
  const [jobTitle, setJobTitle] = useState('Data Scientist');
  const [jobDescription, setJobDescription] = useState(
    'Builds predictive machine learning models, performs statistical analysis, and develops data-driven solutions.'
  );
  const [skills, setSkills] = useState(
    'Python, SQL, Machine Learning, Statistics, Data Analysis'
  );
  const [location, setLocation] = useState('Bengaluru');
  const [experienceMidpoint, setExperienceMidpoint] = useState('4.5');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResponse | null>(null);

  useEffect(() => {
    if (draft) {
      setJobTitle(draft.job_title);
      setJobDescription(draft.job_description);
      setSkills(draft.skills);
      setLocation(draft.location);
      setExperienceMidpoint(String(draft.experience_midpoint_years));
      setError(null);
    }
  }, [draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jobTitle.trim() && !jobDescription.trim() && !skills.trim()) {
      setError('Enter at least a job title, description, or skills.');
      return;
    }
    const expVal = Number(experienceMidpoint);
    if (!Number.isFinite(expVal) || expVal < 0 || expVal > 50) {
      setError('Experience midpoint must be a number between 0 and 50.');
      return;
    }

    setLoading(true);
    try {
      const response = await careerMindApi.classifyJob({
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
        skills: skills.trim(),
        location: location.trim(),
        experience_midpoint_years: expVal,
      });
      setResult(response);
      onResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed.');
    } finally {
      setLoading(false);
    }
  };

  const maxAbsScore = result
    ? Math.max(
        1,
        ...result.decision_scores.map((d) => Math.abs(d.decision_score))
      )
    : 1;

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Job Classification Agent</h1>
         
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
              <h2 className="cm-card-title">Job Profile Input</h2>
              
            </div>
          </div>

          <form className="cm-form" onSubmit={handleSubmit}>
            <div className="cm-field">
              <label className="cm-label" htmlFor="clf-title">
                Job Title
              </label>
              <input
                id="clf-title"
                className="cm-input"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Data Scientist"
              />
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="clf-desc">
                Job Description
              </label>
              <textarea
                id="clf-desc"
                className="cm-textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe responsibilities, workflows, and domain tasks..."
              />
            </div>

            <div className="cm-field">
              <label className="cm-label" htmlFor="clf-skills">
                Skills <span className="cm-label-hint">(comma-separated)</span>
              </label>
              <input
                id="clf-skills"
                className="cm-input"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, SQL, Machine Learning, Statistics"
              />
            </div>

            <div className="cm-form-row-2">
              <div className="cm-field">
                <label className="cm-label" htmlFor="clf-location">
                  Location
                </label>
                <select
                  id="clf-location"
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
                <label className="cm-label" htmlFor="clf-exp">
                  Experience Midpoint (years)
                </label>
                <input
                  id="clf-exp"
                  className="cm-input tabular-nums"
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={experienceMidpoint}
                  onChange={(e) => setExperienceMidpoint(e.target.value)}
                />
              </div>
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
                    Classifying...
                  </>
                ) : (
                  <>
                    <Briefcase size={16} />
                    Classify Job Category
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="cm-card">
          <div className="cm-card-header">
            <div>
              <h2 className="cm-card-title">Classification Result</h2>
             
            </div>
          </div>

          {!result ? (
            <div className="cm-empty-state">
              <Briefcase size={28} strokeWidth={1.6} />
              <p>
                Submit job details on the left to inspect the predicted category
                and LinearSVC decision margins.
              </p>
            </div>
          ) : (
            <div>
              <div className="cm-result-highlight">
                <div className="cm-result-kicker">Predicted Job Category</div>
                <div className="cm-result-main">{result.predicted_category}</div>
                <div className="cm-meta-line">
                  <span>Model: {result.model_info.algorithm}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Top Decision Score:{' '}
                    <strong className="tabular-nums">
                      {result.top_decision_score?.toFixed(4)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="cm-alert cm-alert-info" style={{ marginTop: '16px' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  LinearSVC outputs hyperplane decision margins rather than calibrated
                  probabilities (`predict_proba` is not supported). Higher positive
                  scores indicate stronger separation for that class.
                </span>
              </div>

              <div className="cm-divider" />

              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Submitted Details Echoed to Pipeline
              </h3>
              <div className="cm-kv-list">
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Job Title</span>
                  <span className="cm-kv-value">{result.submitted.job_title || '—'}</span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Location</span>
                  <span className="cm-kv-value">{result.submitted.location}</span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Experience Midpoint</span>
                  <span className="cm-kv-value tabular-nums">
                    {result.submitted.experience_midpoint_years} yrs
                  </span>
                </div>
                <div className="cm-kv-item">
                  <span className="cm-kv-key">Skills</span>
                  <span className="cm-kv-value">{result.submitted.skills || '—'}</span>
                </div>
              </div>

              <div className="cm-divider" />

              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                Decision Scores Across All 12 Categories
              </h3>
              <div className="cm-bar-list">
                {result.decision_scores.slice(0, 6).map((item, idx) => {
                  const pct = Math.max(
                    6,
                    Math.round((Math.max(0, item.decision_score + maxAbsScore) / (2 * maxAbsScore)) * 100)
                  );
                  return (
                    <div className="cm-bar-item" key={item.category}>
                      <div className="cm-bar-header">
                        <span className="cm-bar-label">
                          {idx + 1}. {item.category}
                        </span>
                        <span className="tabular-nums" style={{ fontSize: '12px' }}>
                          {item.decision_score >= 0 ? '+' : ''}
                          {item.decision_score.toFixed(4)}
                        </span>
                      </div>
                      <div className="cm-bar-track">
                        <div
                          className={`cm-bar-fill ${idx === 0 ? '' : 'is-muted'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
