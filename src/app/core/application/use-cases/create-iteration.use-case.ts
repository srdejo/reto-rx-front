import { Injectable, inject } from '@angular/core';
import { isEmail, parseEmails } from '@shared/utils/format.util';
import { CreateIterationInput, Iteration } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

export interface CreateIterationErrors {
  bootcampId: string;
  startDate: string;
  maxQuota: string;
  tutors: string;
}

export interface CreateIterationRawInput {
  bootcampId: string;
  startDate: string;
  maxQuota: string;
  tutors: string;
}

export type CreateIterationResult = { ok: true; iteration: Iteration } | { ok: false; errors: CreateIterationErrors };

@Injectable({ providedIn: 'root' })
export class CreateIterationUseCase {
  private readonly repository = inject(IterationRepository);

  validate(input: CreateIterationRawInput): CreateIterationErrors {
    const quota = Number(input.maxQuota);
    const emails = parseEmails(input.tutors);
    return {
      bootcampId: input.bootcampId ? '' : 'Selecciona un bootcamp.',
      startDate: input.startDate ? '' : 'Selecciona una fecha.',
      maxQuota: Number.isInteger(quota) && quota > 0 ? '' : 'Ingresa un cupo mayor a 0.',
      tutors: !emails.length ? 'Agrega al menos un tutor.' : emails.some((x) => !isEmail(x)) ? 'Hay correos con formato inválido.' : ''
    };
  }

  execute(input: CreateIterationRawInput): CreateIterationResult {
    const errors = this.validate(input);
    if (errors.bootcampId || errors.startDate || errors.maxQuota || errors.tutors) {
      return { ok: false, errors };
    }
    const created: CreateIterationInput = {
      bootcampId: Number(input.bootcampId),
      startDate: input.startDate,
      maxQuota: Number(input.maxQuota),
      tutors: parseEmails(input.tutors)
    };
    return { ok: true, iteration: this.repository.create(created) };
  }
}
