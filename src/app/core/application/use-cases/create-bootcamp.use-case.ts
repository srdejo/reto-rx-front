import { Injectable, inject } from '@angular/core';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';
import { CreateBootcampInput } from '@core/domain/models/bootcamp.model';

export interface CreateBootcampErrors {
  name: string;
  description: string;
  releaseDate: string;
  durationDays: string;
  ids: string;
}

export type CreateBootcampResult =
  | { ok: true }
  | { ok: false; errors: CreateBootcampErrors }
  | { ok: false; apiError: string };

@Injectable({ providedIn: 'root' })
export class CreateBootcampUseCase {
  private readonly repository = inject(BootcampRepository);

  validate(input: CreateBootcampInput): CreateBootcampErrors {
    const name = input.name.trim();
    const description = input.description.trim();
    const ids = input.capacitiesIds.length;
    return {
      name: !name ? 'El nombre es obligatorio.' : name.length > 50 ? 'Máximo 50 caracteres.' : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : '',
      releaseDate: input.releaseDate ? '' : 'Selecciona una fecha.',
      durationDays: input.durationDays > 0 ? '' : 'Ingresa una duración mayor a 0.',
      ids: ids < 1 ? 'Selecciona al menos 1 capacidad.' : ids > 4 ? 'Máximo 4 capacidades.' : ''
    };
  }

  async execute(input: CreateBootcampInput): Promise<CreateBootcampResult> {
    const errors = this.validate(input);
    if (errors.name || errors.description || errors.releaseDate || errors.durationDays || errors.ids) {
      return { ok: false, errors };
    }
    try {
      await this.repository.create({
        name: input.name.trim(),
        description: input.description.trim(),
        releaseDate: input.releaseDate,
        durationDays: input.durationDays,
        capacitiesIds: input.capacitiesIds
      });
      return { ok: true };
    } catch {
      return { ok: false, apiError: 'No se pudo guardar en la API.' };
    }
  }
}
