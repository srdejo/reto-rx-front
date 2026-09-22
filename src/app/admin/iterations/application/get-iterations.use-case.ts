import { Injectable, Signal, inject } from '@angular/core';
import { Iteration } from '../domain/iteration.model';
import { IterationRepository } from '../domain/iteration.repository';

@Injectable({ providedIn: 'root' })
export class GetIterationsUseCase {
  private readonly repository = inject(IterationRepository);

  execute(): Signal<Iteration[]> {
    return this.repository.list();
  }
}
