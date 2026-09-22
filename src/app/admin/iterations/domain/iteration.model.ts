export interface Enrollee {
  name: string;
  email: string;
}

export interface Iteration {
  id: number;
  bootcampId: number;
  startDate: string;
  maxQuota: number;
  tutors: string[];
  participants: Enrollee[];
  deliverables: number;
  tutorToken: string | null;
  partToken: string | null;
}

export type InviteRole = 'tutor' | 'participant';

export interface CreateIterationInput {
  bootcampId: number;
  startDate: string;
  maxQuota: number;
  tutors: string[];
}
