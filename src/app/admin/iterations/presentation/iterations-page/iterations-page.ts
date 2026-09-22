import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetAllBootcampsUseCase } from '../../../bootcamps/application/get-all-bootcamps.use-case';
import { GetIterationsUseCase } from '../../application/get-iterations.use-case';
import { CreateIterationUseCase } from '../../application/create-iteration.use-case';
import { GenerateInviteLinkUseCase, buildInviteUrl } from '../../application/generate-invite-link.use-case';
import { Bootcamp } from '../../../bootcamps/domain/bootcamp.model';
import { ToastService } from '../../../../shared/data-access/toast.service';
import { Drawer } from '../../../../shared/ui/drawer/drawer';
import { addDays, fmt } from '../../../../shared/util/format.util';

@Component({
  selector: 'app-iterations-page',
  imports: [FormsModule, Drawer],
  templateUrl: './iterations-page.html',
  styleUrl: './iterations-page.css'
})
export class IterationsPage {
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);
  private readonly getIterations = inject(GetIterationsUseCase);
  private readonly createIteration = inject(CreateIterationUseCase);
  private readonly generateInviteLink = inject(GenerateInviteLinkUseCase);
  private readonly toast = inject(ToastService);

  private readonly iterations = this.getIterations.execute();

  protected readonly q = signal('');
  protected readonly drawerOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly bootcampId = signal('');
  protected readonly startDate = signal('');
  protected readonly maxQuota = signal('');
  protected readonly tutors = signal('');
  protected readonly copiedKey = signal<string | null>(null);
  protected readonly errors = signal({ bootcampId: '', startDate: '', maxQuota: '', tutors: '' });

  protected readonly bootcamps = signal<Bootcamp[]>([]);

  constructor() {
    this.getAllBootcamps.execute().then((b) => this.bootcamps.set(b));
  }

  protected readonly bootOptions = computed(() => this.bootcamps().map((b) => ({ id: String(b.id), name: b.name })));

  private bootName(id: number): string {
    return this.bootcamps().find((b) => b.id === id)?.name ?? `Bootcamp #${id}`;
  }

  protected readonly cards = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.iterations()
      .filter((it) => !q || this.bootName(it.bootcampId).toLowerCase().includes(q))
      .map((it) => {
        const b = this.bootcamps().find((x) => x.id === it.bootcampId);
        const durationDays = b?.durationDays ?? 0;
        const seats = it.maxQuota - it.participants.length;
        const pct = Math.min(100, Math.round((it.participants.length / it.maxQuota) * 100));
        const full = seats <= 0;
        const link = (role: 'Tutor' | 'Participante', token: string | null, key: string, roleKey: 'tutor' | 'participant') =>
          token
            ? {
                role,
                text: buildInviteUrl(token).replace(/^https?:\/\//, ''),
                cta: this.copiedKey() === key ? 'Copiado' : 'Copiar',
                action: () => this.copy(buildInviteUrl(token), key),
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

  openDrawer(): void {
    this.bootcampId.set('');
    this.startDate.set('');
    this.maxQuota.set('');
    this.tutors.set('');
    this.submitted.set(false);
    this.errors.set({ bootcampId: '', startDate: '', maxQuota: '', tutors: '' });
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  submit(): void {
    this.submitted.set(true);
    const result = this.createIteration.execute({
      bootcampId: this.bootcampId(),
      startDate: this.startDate(),
      maxQuota: this.maxQuota(),
      tutors: this.tutors()
    });
    if (!result.ok) {
      this.errors.set(result.errors);
      return;
    }
    this.toast.show('Iteración creada · genera los enlaces de invitación');
    this.drawerOpen.set(false);
  }

  generate(iterationId: number, role: 'tutor' | 'participant'): void {
    this.generateInviteLink.execute(iterationId, role);
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
