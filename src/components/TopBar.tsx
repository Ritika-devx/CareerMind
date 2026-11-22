import { Menu } from 'lucide-react';
import type { PageId } from '../types/careermind';

interface TopBarProps {
  activePage: PageId;
  onOpenMobile: () => void;
  onQuickAction: () => void;
}

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard',
  classification: 'Job Classification',
  salary: 'Salary Prediction',
  clustering: 'Job Clustering',
  performance: 'Model Performance',
  explorer: 'Dataset Explorer',
};

const ACTION_LABELS: Record<PageId, string> = {
  dashboard: 'Predict Salary',
  classification: 'Load Sample Job',
  salary: 'Load Sample Job',
  clustering: 'Load Sample Job',
  performance: 'Browse Dataset',
  explorer: 'Run Classification',
};

export function TopBar({ activePage, onOpenMobile, onQuickAction }: TopBarProps) {
  return (
    <header className="cm-topbar">
      <div className="cm-topbar-left">
        <button
          type="button"
          className="cm-mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div className="cm-breadcrumb">
          <span>CareerMind</span>
          <span aria-hidden="true"> / </span>
          <strong>{PAGE_TITLES[activePage]}</strong>
        </div>
      </div>

      <button
        type="button"
        className="cm-btn cm-btn-primary cm-btn-sm"
        onClick={onQuickAction}
      >
        {ACTION_LABELS[activePage]}
      </button>
    </header>
  );
}
