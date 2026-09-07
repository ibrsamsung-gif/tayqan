import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FooterPagerProps {
  project: string;
  panel: number;
  onNavigate: (panelIndex: number) => void;
}

const PANEL_NAMES = ['عن المخيم', 'المدربون', 'البرنامج', 'التصويت'];

export const FooterPager: React.FC<FooterPagerProps> = ({
  project,
  panel,
  onNavigate,
}) => {
  return (
    <footer className="site-pager">
      <strong>دليلك نحو الحقيقة</strong>
      <nav aria-label="التنقل بين أقسام الموقع">
        <button
          onClick={() => onNavigate(panel - 1)}
          disabled={panel === 0}
          aria-label="القسم السابق"
        >
          <ArrowRight size={18} />
          <span>السابق</span>
        </button>
        <span className="panel-count" aria-live="polite">
          {PANEL_NAMES[panel]} <bdi>{panel + 1} / 4</bdi>
        </span>
        <button
          onClick={() => onNavigate(panel + 1)}
          disabled={panel === 3}
          aria-label="القسم التالي"
        >
          <span>التالي</span>
          <ArrowLeft size={18} />
        </button>
      </nav>
      <span className="footer-project">{project}</span>
    </footer>
  );
};
