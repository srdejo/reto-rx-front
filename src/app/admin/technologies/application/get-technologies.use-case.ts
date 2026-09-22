import { Injectable, inject } from '@angular/core';
import { Technology } from '../domain/technology.model';
import { TechnologyRepository } from '../domain/technology.repository';

@Injectable({ providedIn: 'root' })
export class GetTechnologiesUseCase {
  private readonly repository = inject(TechnologyRepository);

  execute(): Promise<Technology[]> {
    return this.repository.getAll();
  }
}
