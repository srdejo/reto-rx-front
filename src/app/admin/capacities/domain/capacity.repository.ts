import { PagedResult, SortDirection } from '../../../shared/domain/shared.types';
import { Capacity, CapacitySortKey, CreateCapacityInput } from './capacity.model';

export interface GetCapacitiesPageParams {
  page: number;
  size: number;
  sortBy: CapacitySortKey;
  direction: SortDirection;
}

/**
 * Port: how the application layer talks to capacity storage,
 * regardless of what infrastructure implements it.
 */
export abstract class CapacityRepository {
  abstract getPage(params: GetCapacitiesPageParams): Promise<PagedResult<Capacity>>;
  /** Full, unpaginated catalog — used by pickers and cross-feature lookups. */
  abstract getAll(): Promise<Capacity[]>;
  abstract create(input: CreateCapacityInput): Promise<void>;
}
