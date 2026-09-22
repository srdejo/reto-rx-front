import { Injectable, inject } from '@angular/core';
import { isEmail } from '@shared/utils/format.util';
import { InviteRole } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

export type AcceptInviteResult = { ok: true } | { ok: false; message: string };

@Injectable({ providedIn: 'root' })
export class AcceptInviteUseCase {
  private readonly repository = inject(IterationRepository);

  execute(iterationId: number, role: InviteRole, name: string, email: string): AcceptInviteResult {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !isEmail(trimmedEmail)) {
      return { ok: false, message: 'Ingresa tu nombre y un correo válido.' };
    }
    const error = this.repository.acceptInvite(iterationId, role, trimmedName, trimmedEmail);
    return error ? { ok: false, message: error } : { ok: true };
  }
}
