import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Trainer, Session, CampData } from '../types';
import { AppIcon } from './Icons';

interface TrainerProfileProps {
  trainer: Trainer;
  sessions: Session[];
}

const TrainerProfile: React.FC<TrainerProfileProps> = ({ trainer, sessions }) => {
  return (
    <div className="trainer-profile" id={`profile-${trainer.id}`}>
      <p>{trainer.bio}</p>
      <h4>جلسات المخيم</h4>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>{session.title}</li>
        ))}
      </ul>
    </div>
  );
};

interface TrainerCardProps {
  trainer: Trainer;
  sessions: Session[];
  open: boolean;
  onToggle: () => void;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, sessions, open, onToggle }) => {
  return (
    <article id={trainer.id} className={`trainer-card ${open ? 'expanded' : ''}`}>
      <button
        className="trainer-button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`profile-${trainer.id}`}
      >
        <img
          className="avatar"
          src={trainer.image}
          alt={trainer.name}
          width="124"
          height="124"
          loading="lazy"
          decoding="async"
        />
        <span className="trainer-info">
          <strong>{trainer.name}</strong>
          <span>{trainer.specialty}</span>
        </span>
        <AppIcon name={trainer.icon} size={21} />
        <ChevronDown className="chevron" size={18} />
      </button>
      <div className="profile-wrap" hidden={!open}>
        <TrainerProfile trainer={trainer} sessions={sessions} />
      </div>
    </article>
  );
};

interface TrainersPanelProps {
  data: CampData;
  selectedTrainerId: string | null;
  onSelectTrainer: (id: string | null) => void;
}

export const TrainersPanel: React.FC<TrainersPanelProps> = ({
  data,
  selectedTrainerId,
  onSelectTrainer,
}) => {
  const allSessions = data.days.flatMap((d) => d.sessions);

  const displayedTrainers = data.trainers.filter(
    (t) => !selectedTrainerId || t.id === selectedTrainerId
  );

  return (
    <section className="trainers" id="trainers">
      <div className="section-heading">
        <div>
          <span className="section-number">02 / فريق المخيم</span>
          <h2>تعرّفوا إلى فريق المخيم</h2>
        </div>
        {selectedTrainerId ? (
          <button className="return-trainers" onClick={() => onSelectTrainer(null)}>
            عرض جميع المدربين
          </button>
        ) : (
          <p>خبرات ترافقكم من الفهم إلى الإنتاج</p>
        )}
      </div>

      <div className={`trainers-grid${selectedTrainerId ? ' has-expanded' : ''}`}>
        {displayedTrainers.map((trainer) => {
          const sessions = allSessions.filter((s) => s.trainerId === trainer.id);
          const isOpen = selectedTrainerId === trainer.id;

          return (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              sessions={sessions}
              open={isOpen}
              onToggle={() => onSelectTrainer(isOpen ? null : trainer.id)}
            />
          );
        })}
      </div>
    </section>
  );
};
