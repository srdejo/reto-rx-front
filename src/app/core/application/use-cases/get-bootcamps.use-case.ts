import { Injectable, inject } from '@angular/core';
import { PagedResult } from '@core/domain/models/shared.types';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { BootcampRepository, GetBootcampsPageParams } from '@core/domain/ports/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class GetBootcampsUseCase {
  private readonly repository = inject(BootcampRepository);

  execute(params: GetBootcampsPageParams): Promise<PagedResult<Bootcamp>> {
    return this.repository.getPage(params);
  }
}
