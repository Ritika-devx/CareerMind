import {
  BarChart3,
  Briefcase,
  Database,
  IndianRupee,
  LayoutDashboard,
  Network,
  Sparkles,
  X,
} from 'lucide-react';
import type { PageId } from '../types/careermind';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: PageId;
  label: string;
  section: 'overview' | 'agents' | 'analysis';
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', section: 'overview', icon: LayoutDashboard },
  { id: 'classification', label: 'Job Classification', section: 'agents', icon: Briefcase },
  { id: 'salary', label: 'Salary Prediction', section: 'agents', icon: IndianRupee },
  { id: 'clustering', label: 'Job Clustering', section: 'agents', icon: Network },
  { id: 'performance', label: 'Model Performance', section: 'analysis', icon: BarChart3 },
  { id: 'explorer', label: 'Dataset Explorer', section: 'analysis', icon: Database },
];

export function Sidebar({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  const renderGroup = (section: 'overview' | 'agents' | 'analysis', heading?: string) => (
    <>
      {heading && <div className="cm-nav-section-label">{heading}</div>}
      {NAV_ITEMS.filter((item) => item.section === section).map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            className={`cm-nav-btn ${isActive ? 'is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={17} strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <>
      <div
        className={`cm-backdrop ${mobileOpen ? 'is-open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`cm-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="cm-brand" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="cm-brand-mark" aria-hidden="true">
              <Sparkles size={18} strokeWidth={2.2} />
            </div>
            <span className="cm-brand-name">CareerMind</span>
          </div>
          {mobileOpen && (
            <button
              type="button"
              className="cm-mobile-menu-btn"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="cm-nav-list">
          {renderGroup('overview')}
          {renderGroup('agents', 'ML Agents')}
          {renderGroup('analysis', 'Evaluation & Data')}
        </nav>

        <div className="cm-sidebar-footer">
          <div>24CSE0316 · AI &amp; ML Project</div>
          <div>Trained scikit-learn pipelines</div>
        </div>
      </aside>
    </>
  );
}
