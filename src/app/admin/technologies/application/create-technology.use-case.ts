import { Injectable, inject } from '@angular/core';
import { CreateTechnologyInput } from '../domain/technology.model';
import { TechnologyRepository } from '../domain/technology.repository';

export interface CreateTechnologyErrors {
  name: string;
  description: string;
}

export type CreateTechnologyResult =
  | { ok: true }
  | { ok: false; errors: CreateTechnologyErrors }
  | { ok: false; apiError: string };

@Injectable({ providedIn: 'root' })
export class CreateTechnologyUseCase {
  private readonly repository = inject(TechnologyRepository);

  async validate(input: CreateTechnologyInput): Promise<CreateTechnologyErrors> {
    const name = input.name.trim();
    const description = input.description.trim();
    const existing = await this.repository.getAll();
    const dup = existing.some((t) => t.name.toLowerCase() === name.toLowerCase());
    return {
      name: !name
        ? 'El nombre es obligatorio.'
        : name.length > 50
          ? 'Máximo 50 caracteres.'
          : dup
            ? 'Ya existe una tecnología con ese nombre.'
            : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : ''
    };
  }

  async execute(input: CreateTechnologyInput): Promise<CreateTechnologyResult> {
    const errors = await this.validate(input);
    if (errors.name || errors.description) return { ok: false, errors };
    try {
      await this.repository.create({ name: input.name.trim(), description: input.description.trim() });
      return { ok: true };
    } catch {
      return { ok: false, apiError: 'No se pudo guardar en la API.' };
    }
  }
}
