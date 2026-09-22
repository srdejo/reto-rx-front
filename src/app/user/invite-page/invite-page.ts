import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { BootcampService } from '../../core/bootcamp.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { addDays, fmt, isEmail } from '../../core/format.util';

@Component({
  selector: 'app-invite-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './invite-page.html',
  styleUrl: './invite-page.css'
})
export class InvitePage {
  private readonly route = inject(ActivatedRoute);
  private readonly bootcampService = inject(BootcampService);
  private readonly iterationStore = inject(IterationEnrollmentStore);

  private readonly token = toSignal(this.route.paramMap.pipe(map((p) => p.get('token') ?? '')), { initialValue: '' });

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly error = signal('');
  protected readonly done = signal(false);

  private readonly match = computed(() => this.iterationStore.findByToken(this.token()));

  protected readonly invite = computed(() => {
    const m = this.match();
    if (!m) return null;
    const { iteration: it, role } = m;
    const b = this.bootcampService.allBootcamps().find((x) => x.id === it.bootcampId);
    const durationDays = b?.durationDays ?? 0;
    const seats = this.iterationStore.seatsFor(it);
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
    const name = this.name().trim();
    const email = this.email().trim().toLowerCase();
    if (!name || !isEmail(email)) {
      this.error.set('Ingresa tu nombre y un correo válido.');
      return;
    }
    const err = this.iterationStore.acceptInvite(inv.iterationId, inv.role_, name, email);
    if (err) {
      this.error.set(err);
      return;
    }
    this.error.set('');
    this.done.set(true);
  }
}
