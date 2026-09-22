import { Injectable, inject } from '@angular/core';
import { FindInviteUseCase } from '@core/application/use-cases/find-invite.use-case';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { InviteRole, Iteration } from '@core/domain/models/iteration.model';
import { Bootcamp } from '@core/domain/models/bootcamp.model';

export interface InviteDetails {
  iteration: Iteration;
  role: InviteRole;
  bootcamp: Bootcamp | null;
}

/** Resolves an invite token to its iteration, role, and bootcamp. */
@Injectable({ providedIn: 'root' })
export class GetInviteUseCase {
  private readonly findInvite = inject(FindInviteUseCase);
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);

  async execute(token: string): Promise<InviteDetails | null> {
    const match = this.findInvite.execute(token);
    if (!match) return null;
    const bootcamps = await this.getAllBootcamps.execute();
    const bootcamp = bootcamps.find((b) => b.id === match.iteration.bootcampId) ?? null;
    return { iteration: match.iteration, role: match.role, bootcamp };
  }
}
