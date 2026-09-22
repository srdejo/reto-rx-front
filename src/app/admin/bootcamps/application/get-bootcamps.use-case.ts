import { Injectable, inject } from '@angular/core';
import { PagedResult } from '../../../shared/domain/shared.types';
import { Bootcamp } from '../domain/bootcamp.model';
import { BootcampRepository, GetBootcampsPageParams } from '../domain/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class GetBootcampsUseCase {
  private readonly repository = inject(BootcampRepository);

  execute(params: GetBootcampsPageParams): Promise<PagedResult<Bootcamp>> {
    return this.repository.getPage(params);
  }
}
