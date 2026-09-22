import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GetInviteUseCase, InviteDetails } from '@core/application/use-cases/get-invite.use-case';
import { AcceptInviteUseCase } from '@core/application/use-cases/accept-invite.use-case';
import { seatsFor } from '@core/domain/models/iteration.model';
import { addDays, fmt } from '@shared/utils/format.util';

@Component({
  selector: 'app-invite-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './invite-page.html',
  styleUrl: './invite-page.css'
})
export class InvitePage {
  private readonly route = inject(ActivatedRoute);
  private readonly getInvite = inject(GetInviteUseCase);
  private readonly acceptInvite = inject(AcceptInviteUseCase);

  private readonly token = toSignal(this.route.paramMap.pipe(map((p) => p.get('token') ?? '')), { initialValue: '' });

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly error = signal('');
  protected readonly done = signal(false);
  protected readonly loading = signal(true);
  private readonly match = signal<InviteDetails | null>(null);

  constructor() {
    effect(() => {
      const token = this.token();
      this.loading.set(true);
      this.getInvite.execute(token).then((m) => {
        this.match.set(m);
        this.loading.set(false);
      });
    });
  }

  protected readonly invite = computed(() => {
    const m = this.match();
    if (!m) return null;
    const { iteration: it, role, bootcamp: b } = m;
    const durationDays = b?.durationDays ?? 0;
    const seats = seatsFor(it);
    return {
      role: role === 'tutor' ? 'TUTOR' : 'PARTICIPANTE',
      roleLower: role === 'tutor' ? 'tutor' : 'participante',
      bootcampName: b?.name ?? `Bootcamp #${it.bootcampId}`,
      range: `${fmt(it.startDate)} → ${fmt(addDays(it.startDate, durationDays))}`,
      start: fmt(it.startDate),
      quotaText: role === 'tutor' ? `${it.tutors.length} tutores asignados` : `${Math.max(0, seats)} cupos disponibles`,
      iterationId: it.id,
      role_: role
    };
  });

  accept(): void {
    const inv = this.invite();
    if (!inv) return;
    const result = this.acceptInvite.execute(inv.iterationId, inv.role_, this.name(), this.email());
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    this.error.set('');
    this.done.set(true);
  }
}
