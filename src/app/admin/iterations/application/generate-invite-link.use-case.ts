import { Injectable, inject } from '@angular/core';
import { InviteRole } from '../domain/iteration.model';
import { IterationRepository } from '../domain/iteration.repository';

export function buildInviteUrl(token: string): string {
  return `${location.origin}/user/invite/${token}`;
}

@Injectable({ providedIn: 'root' })
export class GenerateInviteLinkUseCase {
  private readonly repository = inject(IterationRepository);

  execute(iterationId: number, role: InviteRole): string {
    const token = this.repository.generateToken(iterationId, role);
    return buildInviteUrl(token);
  }
}
