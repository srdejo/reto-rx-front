import { Injectable, inject } from '@angular/core';
import { BootcampRepository } from '../domain/bootcamp.repository';

export type DeleteBootcampResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class DeleteBootcampUseCase {
  private readonly repository = inject(BootcampRepository);

  async execute(id: number): Promise<DeleteBootcampResult> {
    try {
      await this.repository.remove(id);
      return { ok: true };
    } catch {
      return { ok: false, message: 'No se pudo eliminar. No se aplicó ningún cambio.' };
    }
  }
}
