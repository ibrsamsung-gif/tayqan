export interface Session {
  id: string;
  time: string;
  title: string;
  shortWord?: string;
  trainerId: string | null;
  trainerLabel: string | null;
  description: string;
  icon: string;
  isBreak: boolean;
  isPanel?: boolean;
  category?: 'workshop' | 'panel' | 'break' | 'lecture' | 'lab';
  categoryLabel?: string;
  duration?: string;
  tags?: string[];
  keyTopics?: string[];
}

export interface Day {
  id: string;
  label: string;
  date: string;
  title: string;
  sessions: Session[];
}

export interface Trainer {
  id: string;
  name: string;
  bio: string;
  specialty: string;
  icon: string;
  image: string;
  initials: string;
}

export interface CampData {
  name: string;
  project: string;
  description: string;
  date: string;
  programPdf: string;
  trainers: Trainer[];
  days: Day[];
}
