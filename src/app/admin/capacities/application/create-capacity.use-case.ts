import { Injectable, inject } from '@angular/core';
import { CapacityRepository } from '../domain/capacity.repository';
import { CreateCapacityInput } from '../domain/capacity.model';

export interface CreateCapacityErrors {
  name: string;
  description: string;
  ids: string;
}

export type CreateCapacityResult =
  | { ok: true }
  | { ok: false; errors: CreateCapacityErrors }
  | { ok: false; apiError: string };

@Injectable({ providedIn: 'root' })
export class CreateCapacityUseCase {
  private readonly repository = inject(CapacityRepository);

  async validate(input: CreateCapacityInput): Promise<CreateCapacityErrors> {
    const name = input.name.trim();
    const description = input.description.trim();
    const ids = input.technologyIds.length;
    const existing = await this.repository.getAll();
    const dup = existing.some((c) => c.name.toLowerCase() === name.toLowerCase());
    return {
      name: !name
        ? 'El nombre es obligatorio.'
        : name.length > 50
          ? 'Máximo 50 caracteres.'
          : dup
            ? 'Ya existe una capacidad con ese nombre.'
            : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : '',
      ids: ids < 3 ? 'Selecciona al menos 3 tecnologías.' : ids > 20 ? 'Máximo 20 tecnologías.' : ''
    };
  }

  async execute(input: CreateCapacityInput): Promise<CreateCapacityResult> {
    const errors = await this.validate(input);
    if (errors.name || errors.description || errors.ids) return { ok: false, errors };
    try {
      await this.repository.create({
        name: input.name.trim(),
        description: input.description.trim(),
        technologyIds: input.technologyIds
      });
      return { ok: true };
    } catch {
      return { ok: false, apiError: 'No se pudo guardar en la API.' };
    }
  }
}
