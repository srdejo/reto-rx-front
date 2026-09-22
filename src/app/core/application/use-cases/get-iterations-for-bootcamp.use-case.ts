import { Injectable, inject } from '@angular/core';
import { Iteration } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

@Injectable({ providedIn: 'root' })
export class GetIterationsForBootcampUseCase {
  private readonly repository = inject(IterationRepository);

  execute(bootcampId: number): Iteration[] {
    return this.repository.list()().filter((i) => i.bootcampId === bootcampId);
  }
}
