export interface Technology {
  id: number;
  name: string;
  description: string;
}

export interface Ref {
  id: number;
  name: string;
}

export interface Capacity {
  id: number;
  name: string;
  description: string;
  technologies: Ref[];
}

export interface Bootcamp {
  id: number;
  name: string;
  // the bootcamp-api list endpoint does not return description today
  description?: string;
  releaseDate: string;
  durationDays: number;
  capacities: Ref[];
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

export interface Enrollee {
  name: string;
  email: string;
}

export interface Enrollment {
  bootcampId: number;
  name: string;
  email: string;
  birthDate: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type SortDirection = 'asc' | 'desc';
