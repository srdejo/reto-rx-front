import { Ref } from '@core/domain/models/shared.types';

export interface Capacity {
  id: number;
  name: string;
  description: string;
  technologies: Ref[];
}

export type CapacitySortKey = 'name' | 'technologyCount';

export interface CreateCapacityInput {
  name: string;
  description: string;
  technologyIds: number[];
}
