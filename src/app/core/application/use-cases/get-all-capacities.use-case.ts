import { Injectable, inject } from '@angular/core';
import { Capacity } from '@core/domain/models/capacity.model';
import { CapacityRepository } from '@core/domain/ports/capacity.repository';

@Injectable({ providedIn: 'root' })
export class GetAllCapacitiesUseCase {
  private readonly repository = inject(CapacityRepository);

  execute(): Promise<Capacity[]> {
    return this.repository.getAll();
  }
}
