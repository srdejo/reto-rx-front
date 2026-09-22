import { Injectable, inject } from '@angular/core';
import { InviteRole, Iteration } from '@core/domain/models/iteration.model';
import { IterationRepository } from '@core/domain/ports/iteration.repository';

export interface InviteMatch {
  iteration: Iteration;
  role: InviteRole;
}

@Injectable({ providedIn: 'root' })
export class FindInviteUseCase {
  private readonly repository = inject(IterationRepository);

  execute(token: string): InviteMatch | null {
    return this.repository.findByToken(token);
  }
}
