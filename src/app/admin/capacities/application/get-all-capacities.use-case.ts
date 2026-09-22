import { Injectable, inject } from '@angular/core';
import { Capacity } from '../domain/capacity.model';
import { CapacityRepository } from '../domain/capacity.repository';

@Injectable({ providedIn: 'root' })
export class GetAllCapacitiesUseCase {
  private readonly repository = inject(CapacityRepository);

  execute(): Promise<Capacity[]> {
    return this.repository.getAll();
  }
}
