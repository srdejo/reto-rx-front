import { PagedResult, SortDirection } from '../../../shared/domain/shared.types';
import { Bootcamp, BootcampSortKey, CreateBootcampInput } from './bootcamp.model';

export interface GetBootcampsPageParams {
  page: number;
  size: number;
  sortBy: BootcampSortKey;
  direction: SortDirection;
}

/**
 * Port: how the application layer talks to bootcamp storage,
 * regardless of what infrastructure implements it.
 */
export abstract class BootcampRepository {
  abstract getPage(params: GetBootcampsPageParams): Promise<PagedResult<Bootcamp>>;
  /** Full, unpaginated catalog — used by the public listing and cross-feature lookups. */
  abstract getAll(): Promise<Bootcamp[]>;
  abstract create(input: CreateBootcampInput): Promise<void>;
  abstract remove(id: number): Promise<void>;
}
