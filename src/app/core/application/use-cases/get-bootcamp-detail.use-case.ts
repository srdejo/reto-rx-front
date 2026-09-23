import { Injectable, inject } from '@angular/core';
import { BootcampDetail } from '@core/domain/models/bootcamp.model';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';

/** Loads one bootcamp with its capacities and technologies for the public detail page. */
@Injectable({ providedIn: 'root' })
export class GetBootcampDetailUseCase {
  private readonly repository = inject(BootcampRepository);

  execute(bootcampId: number): Promise<BootcampDetail | null> {
    return this.repository.getById(bootcampId);
  }
}
