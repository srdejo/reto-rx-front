import { Injectable, inject } from '@angular/core';
import { PagedResult } from '../../../shared/domain/shared.types';
import { Capacity } from '../domain/capacity.model';
import { CapacityRepository, GetCapacitiesPageParams } from '../domain/capacity.repository';

@Injectable({ providedIn: 'root' })
export class GetCapacitiesUseCase {
  private readonly repository = inject(CapacityRepository);

  execute(params: GetCapacitiesPageParams): Promise<PagedResult<Capacity>> {
    return this.repository.getPage(params);
  }
}
