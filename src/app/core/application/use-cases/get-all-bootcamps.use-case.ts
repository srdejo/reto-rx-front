import { Injectable, inject } from '@angular/core';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class GetAllBootcampsUseCase {
  private readonly repository = inject(BootcampRepository);

  execute(): Promise<Bootcamp[]> {
    return this.repository.getAll();
  }
}
