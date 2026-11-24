import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { careerMindApi, formatInr } from '../services/api';
import type { JobRecord, JobsExplorerResponse, PageId } from '../types/careermind';

interface DatasetExplorerPageProps {
  onSendJobToAgent: (job: JobRecord, target: PageId) => void;
}

export function DatasetExplorerPage({ onSendJobToAgent }: DatasetExplorerPageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<JobsExplorerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await careerMindApi.getJobs({
          q: search.trim(),
          category,
          location,
          experience_level: expLevel,
          sort,
          page: targetPage,
          limit: 12,
        });
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to query dataset.');
      } finally {
        setLoading(false);
      }
    },
    [search, category, location, expLevel, sort]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(page);
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchJobs, page]);

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setExpLevel('');
    setSort('default');
    setPage(1);
  };

  const maxTitleCount = data
    ? Math.max(1, ...data.overview.distributions.by_title_top_15.map((t) => t.count))
    : 1;

  return (
    <>
      <section className="cm-page-header">
        <div>
          <h1 className="cm-page-title">Dataset Explorer</h1>
          
        </div>
      </section>

      {data && (
        <>
          <section className="cm-kpi-grid">
            <div className="cm-kpi-card">
              <div className="cm-kpi-label">Total Records</div>
              <div className="cm-kpi-value tabular-nums">
                {data.overview.total_records.toLocaleString('en-IN')}
              </div>
              <div className="cm-kpi-note">{data.overview.columns.length} columns</div>
            </div>
            <div className="cm-kpi-card">
              <div className="cm-kpi-label">Job Categories</div>
              <div className="cm-kpi-value tabular-nums">
                {data.overview.unique_categories}
              </div>
              <div className="cm-kpi-note">500 postings per category</div>
            </div>
            <div className="cm-kpi-card">
              <div className="cm-kpi-label">Unique Job Titles</div>
              <div className="cm-kpi-value tabular-nums">
                {data.overview.unique_job_titles}
              </div>
              <div className="cm-kpi-note">{data.overview.unique_locations} Indian cities / remote</div>
            </div>
            <div className="cm-kpi-card">
              <div className="cm-kpi-label">Mean Annual Salary</div>
              <div className="cm-kpi-value tabular-nums">
                {formatInr(data.overview.salary_summary.mean_inr)}
              </div>
              <div className="cm-kpi-note">
                {formatInr(data.overview.salary_summary.min_inr)} –{' '}
                {formatInr(data.overview.salary_summary.max_inr)}
              </div>
            </div>
          </section>

          <section className="cm-grid-2">
            <div className="cm-card">
              <div className="cm-card-header">
                <div>
                  <h2 className="cm-card-title">Job Category Distribution</h2>
                  <p className="cm-card-desc">
                    All {data.overview.unique_categories} categories in the master dataset
                  </p>
                </div>
              </div>
              <div className="cm-bar-list">
                {data.overview.distributions.by_category.map((item) => (
                  <div className="cm-bar-item" key={item.name}>
                    <div className="cm-bar-header">
                      <span className="cm-bar-label">{item.name}</span>
                      <span className="tabular-nums" style={{ fontSize: '12px' }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="cm-bar-track">
                      <div
                        className="cm-bar-fill"
                        style={{
                          width: `${Math.round(
                            (item.count / Math.max(1, data.overview.total_records / 12)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cm-card">
              <div className="cm-card-header">
                <div>
                  <h2 className="cm-card-title">Top Job Titles &amp; Schema Columns</h2>
                  <p className="cm-card-desc">
                    Top 10 job titles by posting count · {data.overview.columns.length} schema fields
                  </p>
                </div>
              </div>
              <div className="cm-bar-list">
                {data.overview.distributions.by_title_top_15.slice(0, 10).map((item) => (
                  <div className="cm-bar-item" key={item.name}>
                    <div className="cm-bar-header">
                      <span className="cm-bar-label">{item.name}</span>
                      <span className="tabular-nums" style={{ fontSize: '12px' }}>
                        {item.count}
                      </span>
                    </div>
                    <div className="cm-bar-track">
                      <div
                        className="cm-bar-fill is-purple"
                        style={{
                          width: `${Math.round((item.count / maxTitleCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="cm-divider" />
              <div style={{ fontSize: '12px', color: 'var(--text-slate)', lineHeight: 1.6 }}>
             
              </div>
            </div>
          </section>
        </>
      )}

      <section className="cm-card">
        <div className="cm-card-header">
          <div>
            <h2 className="cm-card-title">Search &amp; Filter Job Records</h2>
            <p className="cm-card-desc">
              Click any agent button on a row to pre-fill and test that real job posting.
            </p>
          </div>
          {(search || category || location || expLevel || sort !== 'default') && (
            <button
              type="button"
              className="cm-btn cm-btn-secondary cm-btn-sm"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div className="cm-field">
            <label className="cm-label" htmlFor="exp-search">
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="exp-search"
                className="cm-input"
                style={{ paddingLeft: '32px' }}
                type="text"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                placeholder="Title, skill, ID..."
              />
            </div>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="exp-cat">
              Category
            </label>
            <select
              id="exp-cat"
              className="cm-select"
              value={category}
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
            >
              <option value="">All Categories</option>
              {data?.overview.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="exp-loc">
              Location
            </label>
            <select
              id="exp-loc"
              className="cm-select"
              value={location}
              onChange={(e) => handleFilterChange(setLocation, e.target.value)}
            >
              <option value="">All Locations</option>
              {data?.overview.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="exp-lvl">
              Experience Level
            </label>
            <select
              id="exp-lvl"
              className="cm-select"
              value={expLevel}
              onChange={(e) => handleFilterChange(setExpLevel, e.target.value)}
            >
              <option value="">All Levels</option>
              {data?.overview.experience_levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="cm-field">
            <label className="cm-label" htmlFor="exp-sort">
              Sort By
            </label>
            <select
              id="exp-sort"
              className="cm-select"
              value={sort}
              onChange={(e) => handleFilterChange(setSort, e.target.value)}
            >
              <option value="default">Dataset Order</option>
              <option value="salary_desc">Salary: High to Low</option>
              <option value="salary_asc">Salary: Low to High</option>
              <option value="exp_desc">Experience: High to Low</option>
              <option value="exp_asc">Experience: Low to High</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="cm-alert cm-alert-error" style={{ marginBottom: '14px' }}>
            <span>{error}</span>
          </div>
        )}

        {loading && !data ? (
          <div className="cm-empty-state">
            <div className="cm-spinner" />
            <p>Loading dataset records...</p>
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="cm-empty-state">
            <p>No job records match the active search or filters.</p>
            <button
              type="button"
              className="cm-btn cm-btn-secondary cm-btn-sm"
              onClick={resetFilters}
            >
              Clear All Filters
            </button>
          </div>
        ) : data ? (
          <>
            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Job Title &amp; Skills</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Level</th>
                    <th className="is-num">Exp</th>
                    <th className="is-num">Avg Salary</th>
                    <th>Test in Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((job) => (
                    <tr key={job.job_id}>
                      <td className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {job.job_id}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600 }}>{job.job_title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-slate)' }}>
                          {job.skills}
                        </div>
                      </td>
                      <td>{job.job_category}</td>
                      <td>{job.location}</td>
                      <td>{job.experience_level}</td>
                      <td className="is-num">
                        {job.experience_min_years}–{job.experience_max_years}y
                      </td>
                      <td className="is-num" style={{ fontWeight: 600 }}>
                        {formatInr(job.average_annual_salary_inr)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            className="cm-btn cm-btn-secondary cm-btn-sm"
                            onClick={() => onSendJobToAgent(job, 'classification')}
                          >
                            Classify
                          </button>
                          <button
                            type="button"
                            className="cm-btn cm-btn-secondary cm-btn-sm"
                            onClick={() => onSendJobToAgent(job, 'salary')}
                          >
                            Salary
                          </button>
                          <button
                            type="button"
                            className="cm-btn cm-btn-secondary cm-btn-sm"
                            onClick={() => onSendJobToAgent(job, 'clustering')}
                          >
                            Cluster
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-hairline)',
                fontSize: '13px',
                color: 'var(--text-slate)',
              }}
            >
              <span className="tabular-nums">
                Showing {data.items.length} of {data.total_filtered.toLocaleString('en-IN')}{' '}
                matching records · Page {data.page} of {data.total_pages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary cm-btn-sm"
                  disabled={data.page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary cm-btn-sm"
                  disabled={data.page >= data.total_pages || loading}
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}
