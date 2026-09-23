import { Ref } from '@core/domain/models/shared.types';

export interface Bootcamp {
  id: number;
  name: string;
  // the bootcamp-api list endpoint does not return description today
  description?: string;
  releaseDate: string;
  durationDays: number;
  capacities: Ref[];
}

export interface BootcampCapacity extends Ref {
  description?: string;
  technologies: Ref[];
}

/** A single bootcamp as returned by GET /bootcamps/{id}: capacities come with their technologies. */
export interface BootcampDetail extends Bootcamp {
  capacities: BootcampCapacity[];
}

export type BootcampSortKey = 'name' | 'capacityCount';

export interface CreateBootcampInput {
  name: string;
  description: string;
  releaseDate: string;
  durationDays: number;
  capacitiesIds: number[];
}
