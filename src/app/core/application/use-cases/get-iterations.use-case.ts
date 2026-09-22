import { Injectable, Signal, inject } from '@angular/core';
import { Iteration } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

@Injectable({ providedIn: 'root' })
export class GetIterationsUseCase {
  private readonly repository = inject(IterationRepository);

  execute(): Signal<Iteration[]> {
    return this.repository.list();
  }
}
