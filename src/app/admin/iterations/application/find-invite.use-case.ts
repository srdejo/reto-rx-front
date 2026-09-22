import { Injectable, inject } from '@angular/core';
import { InviteRole, Iteration } from '../domain/iteration.model';
import { IterationRepository } from '../domain/iteration.repository';

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
