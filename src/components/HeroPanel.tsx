import React from 'react';
import { CalendarDays, ArrowLeft, FileSearch, SearchCheck, Clapperboard } from 'lucide-react';
import { CampData } from '../types';
import { getAssetUrl } from '../utils/assetUrl';

interface HeroPanelProps {
  data: CampData;
  onNavigateToProgram: () => void;
}

const JOURNEY_STEPS = [
  { title: 'فهم المحتوى', icon: FileSearch, stage: 'المرحلة 01', num: '01' },
  { title: 'التحقق منه', icon: SearchCheck, stage: 'المرحلة 02', num: '02' },
  { title: 'إنتاجه', icon: Clapperboard, stage: 'المرحلة 03', num: '03' },
];

export const HeroPanel: React.FC<HeroPanelProps> = ({ data, onNavigateToProgram }) => {
  return (
    <section className="hero" id="about">
      <div className="hero-copy">
        <span className="eyebrow">
          <span className="dot" /> مخيم تدريبي · منصة تَيَقَّن
        </span>
        <h1>
          ما وراء
          <br />
          <em>المحتوى</em>
          <span className="title-dot">.</span>
        </h1>
        <p className="lead">ثلاثة أيام… رحلة واحدة من الفهم إلى التحقق ثم الإنتاج.</p>
        <div className="date">
          <CalendarDays size={20} />
          <span>{data.date}</span>
        </div>
        <a
          className="primary"
          href="#program"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToProgram();
          }}
        >
          استكشفوا برنامج المخيم <ArrowLeft size={19} />
        </a>
      </div>

      <div className="journey-window">
        <div className="window-bar">
          <span>رحلة المخيم</span>
          <span className="window-dots">● ● ●</span>
        </div>
        <div className="journey-body">
          <div className="journey-line" />
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className={`journey-step step-${idx}`}>
                <span className="step-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <small>{step.stage}</small>
                  <h3>{step.title}</h3>
                </div>
                <span className="step-number">{step.num}</span>
              </div>
            );
          })}
          <div className="journey-foot">
            <span className="dot" /> من المعرفة إلى التطبيق
          </div>
        </div>
      </div>

      <div className="about-strip">
        <div className="about-statement">
          <span className="section-number">01 / عن المخيم</span>
          <p>{data.description}</p>
        </div>
        <aside className="supporter-mark">
          <img
            src={getAssetUrl('brand/supporter-logos.png')}
            width="1920"
            height="400"
            alt="شعارات CFI والاتحاد الأوروبي وExpertise France"
            decoding="async"
          />
        </aside>
      </div>
    </section>
  );
};
