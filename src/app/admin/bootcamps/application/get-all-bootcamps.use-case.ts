import { Injectable, inject } from '@angular/core';
import { Bootcamp } from '../domain/bootcamp.model';
import { BootcampRepository } from '../domain/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class GetAllBootcampsUseCase {
  private readonly repository = inject(BootcampRepository);

  execute(): Promise<Bootcamp[]> {
    return this.repository.getAll();
  }
}
