export type Vocation =
  | 'lavrador'
  | 'andarilho'
  | 'aprendiz_artesao'
  | 'aspirante_guarda'
  | 'comerciante_ambulante';

export type ObjectiveType =
  | 'social'
  | 'economic'
  | 'exploratory'
  | 'spiritual'
  | 'military'
  | 'artisanal';

export interface Objective {
  id: string;
  description: string;
  type: ObjectiveType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  requirements: Requirement[];
  progressScore: number;
}

export interface Requirement {
  type: string;
  target: number;
  current: number;
}

export interface Commitment {
  id: string;
  description: string;
  deadline: Date;
  urgency: 'low' | 'medium' | 'high';
  targetCharacterId?: string;
  taskId?: string;
  createdAt: Date;
}

export function getCommitmentModifier(ticksRemaining: number): number {
  if (ticksRemaining > 3) return 1;
  if (ticksRemaining >= 2) return 2;
  if (ticksRemaining >= 1) return 3;
  return 3;
}
