import { Injectable, inject } from '@angular/core';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';

export type EnrollResult = { ok: true } | { ok: false; message: string };

/**
 * Enrolls the authenticated person (identified by the JWT) in a bootcamp.
 * The backend enforces the business rules (max 5 active, no date overlap).
 */
@Injectable({ providedIn: 'root' })
export class EnrollInBootcampUseCase {
  private readonly enrollmentRepository = inject(EnrollmentRepository);

  async execute(bootcampId: number): Promise<EnrollResult> {
    const error = await this.enrollmentRepository.enroll(bootcampId);
    return error ? { ok: false, message: error } : { ok: true };
  }
}
