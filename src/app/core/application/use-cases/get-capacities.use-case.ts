import { Injectable, inject } from '@angular/core';
import { PagedResult } from '@core/domain/models/shared.types';
import { Capacity } from '@core/domain/models/capacity.model';
import { CapacityRepository, GetCapacitiesPageParams } from '@core/domain/ports/capacity.repository';

@Injectable({ providedIn: 'root' })
export class GetCapacitiesUseCase {
  private readonly repository = inject(CapacityRepository);

  execute(params: GetCapacitiesPageParams): Promise<PagedResult<Capacity>> {
    return this.repository.getPage(params);
  }
}
