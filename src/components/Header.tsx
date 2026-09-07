import React from 'react';
import { TayqanLogo } from './Icons';
import { SoundToggle } from './SoundToggle';

interface HeaderProps {
  currentPanel: number;
  onNavigate: (panelIndex: number) => void;
}

const PANELS = [
  { id: 'about', label: 'عن المخيم' },
  { id: 'trainers', label: 'المدربون' },
  { id: 'program', label: 'البرنامج' },
  { id: 'evaluation', label: 'التصويت' },
];

export const Header: React.FC<HeaderProps> = ({ currentPanel, onNavigate }) => {
  return (
    <header>
      <a
        href="#about"
        aria-label="تَيَقَّن، الرئيسية"
        onClick={(e) => {
          e.preventDefault();
          onNavigate(0);
        }}
      >
        <TayqanLogo />
      </a>

      <nav aria-label="التنقل الرئيسي">
        {PANELS.map((panel, idx) => (
          <a
            key={panel.id}
            href={`#${panel.id}`}
            aria-current={currentPanel === idx ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(idx);
            }}
          >
            <span className="nav-step">0{idx + 1}</span>
            {panel.label}
          </a>
        ))}
      </nav>

      <div className="header-tools">
        <span className="header-date">
          أيلول 2026 <span className="dot" />
        </span>
        <SoundToggle />
      </div>
    </header>
  );
};
