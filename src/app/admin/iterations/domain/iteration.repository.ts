import { Signal } from '@angular/core';
import { CreateIterationInput, InviteRole, Iteration } from './iteration.model';

/**
 * Port: how the application layer talks to iteration storage. There is no
 * backend service for iterations today, so the only implementation is an
 * in-memory adapter — but callers depend only on this abstraction.
 *
 * `list()` returns a live signal (rather than a Promise) because iterations
 * are held in memory and the UI should react to mutations immediately.
 */
export abstract class IterationRepository {
  abstract list(): Signal<Iteration[]>;
  abstract create(input: CreateIterationInput): Iteration;
  abstract removeByBootcamp(bootcampId: number): void;
  abstract generateToken(iterationId: number, role: InviteRole): string;
  abstract findByToken(token: string): { iteration: Iteration; role: InviteRole } | null;
  abstract acceptInvite(iterationId: number, role: InviteRole, name: string, email: string): string | null;
}
