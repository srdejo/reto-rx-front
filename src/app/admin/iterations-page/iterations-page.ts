import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BootcampService } from '../../core/bootcamp.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { ToastService } from '../../core/toast.service';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { addDays, fmt, isEmail, parseEmails } from '../../core/format.util';

@Component({
  selector: 'app-iterations-page',
  imports: [FormsModule, Drawer],
  templateUrl: './iterations-page.html',
  styleUrl: './iterations-page.css'
})
export class IterationsPage {
  private readonly bootcampService = inject(BootcampService);
  private readonly iterationStore = inject(IterationEnrollmentStore);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly drawerOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly bootcampId = signal('');
  protected readonly startDate = signal('');
  protected readonly maxQuota = signal('');
  protected readonly tutors = signal('');
  protected readonly copiedKey = signal<string | null>(null);

  constructor() {
    this.bootcampService.loadAll();
  }

  protected readonly bootOptions = computed(() =>
    this.bootcampService.allBootcamps().map((b) => ({ id: String(b.id), name: b.name }))
  );

  private bootName(id: number): string {
    return this.bootcampService.allBootcamps().find((b) => b.id === id)?.name ?? `Bootcamp #${id}`;
  }

  private inviteUrl(token: string): string {
    return `${location.origin}/user/invite/${token}`;
  }

  protected readonly cards = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.iterationStore
      .iterations()
      .filter((it) => !q || this.bootName(it.bootcampId).toLowerCase().includes(q))
      .map((it) => {
        const b = this.bootcampService.allBootcamps().find((x) => x.id === it.bootcampId);
        const durationDays = b?.durationDays ?? 0;
        const seats = it.maxQuota - it.participants.length;
        const pct = Math.min(100, Math.round((it.participants.length / it.maxQuota) * 100));
        const full = seats <= 0;
        const link = (role: 'Tutor' | 'Participante', token: string | null, key: string, roleKey: 'tutor' | 'participant') =>
          token
            ? {
                role,
                text: this.inviteUrl(token).replace(/^https?:\/\//, ''),
                cta: this.copiedKey() === key ? 'Copiado' : 'Copiar',
                action: () => this.copy(this.inviteUrl(token), key),
                on: true
              }
            : {
                role,
                text: 'Sin enlace generado',
                cta: 'Generar',
                action: () => this.generate(it.id, roleKey),
                on: false
              };
        return {
          id: String(it.id).padStart(2, '0'),
          bootcampName: this.bootName(it.bootcampId),
          range: `${fmt(it.startDate)} → ${fmt(addDays(it.startDate, durationDays))}`,
          tutorsText: `${it.tutors.length} ${it.tutors.length === 1 ? 'tutor' : 'tutores'}`,
          deliverablesText: `${it.deliverables} ${it.deliverables === 1 ? 'entregable' : 'entregables'}`,
          quotaText: `${it.participants.length} / ${it.maxQuota}`,
          pct: `${pct}%`,
          barColor: full ? 'var(--danger)' : pct >= 80 ? 'var(--primary)' : 'var(--success)',
          status: full ? 'Cupo lleno' : `${seats} cupos disponibles`,
          links: [
            link('Tutor', it.tutorToken, `tutor-${it.id}`, 'tutor'),
            link('Participante', it.partToken, `participant-${it.id}`, 'participant')
          ]
        };
      });
  });

  protected readonly errors = computed(() => {
    if (!this.submitted()) return { bootcampId: '', startDate: '', maxQuota: '', tutors: '' };
    const quota = Number(this.maxQuota());
    const emails = parseEmails(this.tutors());
    return {
      bootcampId: this.bootcampId() ? '' : 'Selecciona un bootcamp.',
      startDate: this.startDate() ? '' : 'Selecciona una fecha.',
      maxQuota: Number.isInteger(quota) && quota > 0 ? '' : 'Ingresa un cupo mayor a 0.',
      tutors: !emails.length ? 'Agrega al menos un tutor.' : emails.some((x) => !isEmail(x)) ? 'Hay correos con formato inválido.' : ''
    };
  });

  openDrawer(): void {
    this.bootcampId.set('');
    this.startDate.set('');
    this.maxQuota.set('');
    this.tutors.set('');
    this.submitted.set(false);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  submit(): void {
    this.submitted.set(true);
    const e = this.errors();
    if (e.bootcampId || e.startDate || e.maxQuota || e.tutors) return;
    this.iterationStore.createIteration({
      bootcampId: Number(this.bootcampId()),
      startDate: this.startDate(),
      maxQuota: Number(this.maxQuota()),
      tutors: parseEmails(this.tutors())
    });
    this.toast.show('Iteración creada · genera los enlaces de invitación');
    this.drawerOpen.set(false);
  }

  generate(iterationId: number, role: 'tutor' | 'participant'): void {
    this.iterationStore.generateToken(iterationId, role);
    this.toast.show(`Enlace de ${role === 'tutor' ? 'tutor' : 'participante'} generado`);
  }

  copy(url: string, key: string): void {
    try {
      navigator.clipboard?.writeText(url).catch(() => {});
    } catch {
      /* clipboard unavailable */
    }
    this.copiedKey.set(key);
    this.toast.show('Enlace copiado');
    setTimeout(() => {
      if (this.copiedKey() === key) this.copiedKey.set(null);
    }, 1800);
  }
}
