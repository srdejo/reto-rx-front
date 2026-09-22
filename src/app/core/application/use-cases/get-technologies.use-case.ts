import { Injectable, inject } from '@angular/core';
import { Technology } from '@core/domain/models/technology.model';
import { TechnologyRepository } from '@core/domain/ports/technology.repository';

@Injectable({ providedIn: 'root' })
export class GetTechnologiesUseCase {
  private readonly repository = inject(TechnologyRepository);

  execute(): Promise<Technology[]> {
    return this.repository.getAll();
  }
}
