import { Injectable, inject } from '@angular/core';
import { addDays, fmt, isEmail, todayIso } from '@shared/utils/format.util';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';

export type EnrollResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class EnrollInBootcampUseCase {
  private readonly enrollmentRepository = inject(EnrollmentRepository);
  private readonly bootcampRepository = inject(BootcampRepository);

  async execute(bootcampId: number, name: string, email: string, birthDate: string): Promise<EnrollResult> {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !isEmail(trimmedEmail)) {
      return { ok: false, message: 'Ingresa tu nombre y un correo válido.' };
    }
    if (!birthDate) {
      return { ok: false, message: 'Ingresa tu fecha de nacimiento.' };
    }
    if (birthDate >= todayIso()) {
      return { ok: false, message: 'La fecha de nacimiento debe ser anterior a hoy.' };
    }

    const bootcamps = await this.bootcampRepository.getAll();
    const target = bootcamps.find((b) => b.id === bootcampId);
    if (!target) return { ok: false, message: 'Bootcamp no encontrado.' };

    const end = (releaseDate: string, durationDays: number) => addDays(releaseDate, durationDays);
    const targetEnd = end(target.releaseDate, target.durationDays);
    const mine = this.enrollmentRepository.list()().filter((e) => e.email.toLowerCase() === trimmedEmail);
    const clash = mine
      .map((e) => bootcamps.find((b) => b.id === e.bootcampId))
      .filter((b): b is NonNullable<typeof b> => !!b)
      .find((b) => b.releaseDate < targetEnd && target.releaseDate < end(b.releaseDate, b.durationDays));
    if (clash) {
      return {
        ok: false,
        message: `Las fechas se cruzan con ${clash.name} (${fmt(clash.releaseDate)} → ${fmt(end(clash.releaseDate, clash.durationDays))}).`
      };
    }

    const error = this.enrollmentRepository.enroll(bootcampId, trimmedName, trimmedEmail, birthDate);
    return error ? { ok: false, message: error } : { ok: true };
  }
}
