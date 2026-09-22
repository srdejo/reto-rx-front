import { Ref } from '../../../shared/domain/shared.types';

export interface Bootcamp {
  id: number;
  name: string;
  // the bootcamp-api list endpoint does not return description today
  description?: string;
  releaseDate: string;
  durationDays: number;
  capacities: Ref[];
}

export type BootcampSortKey = 'name' | 'capacityCount';

export interface CreateBootcampInput {
  name: string;
  description: string;
  releaseDate: string;
  durationDays: number;
  capacitiesIds: number[];
}
