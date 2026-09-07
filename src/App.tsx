import React, { useState, useEffect, useRef } from 'react';
import { campData } from './data';
import { Header } from './components/Header';
import { HeroPanel } from './components/HeroPanel';
import { TrainersPanel } from './components/TrainersPanel';
import { ProgramPanel } from './components/ProgramPanel';
import { TrainingEvaluation } from './components/TrainingEvaluation';
import { FooterPager } from './components/FooterPager';

const PANELS = ['about', 'trainers', 'program', 'evaluation'];

const getInitialPanel = (): number => {
  const hash = window.location.hash.slice(1);
  const idx = PANELS.indexOf(hash);
  return idx >= 0 ? idx : 0;
};

export default function App() {
  const [panel, setPanel] = useState<number>(getInitialPanel);
  const [direction, setDirection] = useState<number>(1);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const scrollTargetTrainerRef = useRef<string | null>(null);

  const navigateToPanel = (nextPanel: number) => {
    setDirection(nextPanel >= panel ? 1 : -1);
    setPanel(nextPanel);
    window.history.replaceState(null, '', '#' + PANELS[nextPanel]);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const p = getInitialPanel();
      setPanel(p);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (panel !== 1 || !scrollTargetTrainerRef.current) return;
    const targetId = scrollTargetTrainerRef.current;
    scrollTargetTrainerRef.current = null;

    const frameId = requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'nearest' });
      const btn = document.querySelector<HTMLButtonElement>(`#${targetId} button`);
      btn?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frameId);
  }, [panel, selectedTrainerId]);

  const handleTrainerFromProgram = (trainerId: string) => {
    scrollTargetTrainerRef.current = trainerId;
    setSelectedTrainerId(trainerId);
    navigateToPanel(1);
  };

  return (
    <div className="site-shell">
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        انتقل إلى المحتوى
      </a>

      <Header 
        currentPanel={panel} 
        onNavigate={navigateToPanel} 
      />

      <main id="main" className="panel-stage" tabIndex={-1}>
        <div
          className="panel-content"
          key={panel}
          style={
            {
              '--panel-offset': `${direction * -24}px`,
            } as React.CSSProperties
          }
        >
          {panel === 0 && (
            <HeroPanel
              data={campData}
              onNavigateToProgram={() => navigateToPanel(2)}
            />
          )}
          {panel === 1 && (
            <TrainersPanel
              data={campData}
              selectedTrainerId={selectedTrainerId}
              onSelectTrainer={setSelectedTrainerId}
            />
          )}
          {panel === 2 && (
            <ProgramPanel
              data={campData}
              onTrainerClick={handleTrainerFromProgram}
              onNavigateToEvaluation={() => navigateToPanel(3)}
            />
          )}
          {panel === 3 && (
            <TrainingEvaluation
              onNavigateToProgram={() => navigateToPanel(2)}
            />
          )}
        </div>
      </main>

      <FooterPager
        project={campData.project}
        panel={panel}
        onNavigate={navigateToPanel}
      />
    </div>
  );
}
