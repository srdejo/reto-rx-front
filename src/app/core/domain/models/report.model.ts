import { Ref } from '@core/domain/models/shared.types';

export interface ReportCapacity extends Ref {
  technologies: Ref[];
}

export interface EnrolledPerson {
  id: number;
  name: string;
  email: string;
}

/** Read model built by report-api: a bootcamp with its capacities, technologies and enrolled persons. */
export interface BootcampReport {
  bootcampId: number;
  name: string;
  description?: string;
  releaseDate: string;
  durationDays: number;
  capacities: ReportCapacity[];
  capacityCount: number;
  technologyCount: number;
  enrolledCount: number;
  enrolledPersons: EnrolledPerson[];
  updatedAt: string;
}
