import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GetBootcampDetailUseCase } from '@core/application/use-cases/get-bootcamp-detail.use-case';
import { GetEnrollmentsUseCase } from '@core/application/use-cases/get-enrollments.use-case';
import { Bootcamp, BootcampDetail } from '@core/domain/models/bootcamp.model';
import { addDays, fmt } from '@shared/utils/format.util';
import { EnrollModal } from '@shared/components/enroll-modal/enroll-modal';

@Component({
  selector: 'app-bootcamp-detail-page',
  imports: [RouterLink, EnrollModal],
  templateUrl: './bootcamp-detail-page.html',
  styleUrl: './bootcamp-detail-page.css'
})
export class BootcampDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly getBootcampDetail = inject(GetBootcampDetailUseCase);
  private readonly getEnrollments = inject(GetEnrollmentsUseCase);

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: NaN });

  protected readonly loading = signal(true);
  protected readonly enrollTarget = signal<Bootcamp | null>(null);
  protected readonly detailData = signal<BootcampDetail | null>(null);
  protected readonly loadError = signal<string | null>(null);
  private readonly myBootcampIds = signal<ReadonlySet<number>>(new Set());

  protected readonly isEnrolled = computed(() => this.myBootcampIds().has(this.id()));

  constructor() {
    effect(() => {
      this.load(this.id());
    });
    this.getEnrollments.myBootcampIds().then((ids) => this.myBootcampIds.set(new Set(ids)));
  }

  private async load(bootcampId: number): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.detailData.set(await this.getBootcampDetail.execute(bootcampId));
    } catch {
      this.detailData.set(null);
      this.loadError.set('No se pudo cargar el bootcamp. Intenta de nuevo más tarde.');
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly notFound = computed(() => !this.loading() && !this.loadError() && !this.detailData());

  protected readonly detail = computed(() => {
    const b = this.detailData();
    if (!b) return null;
    return {
      bootcamp: b,
      releaseDateText: fmt(b.releaseDate),
      durationText: `${b.durationDays} días`,
      range: `${fmt(b.releaseDate)} → ${fmt(addDays(b.releaseDate, b.durationDays))}`,
      technologyCount: new Set(b.capacities.flatMap((c) => c.technologies.map((t) => t.id))).size
    };
  });

  openEnroll(): void {
    const b = this.detailData();
    if (b) this.enrollTarget.set(b);
  }

  closeEnroll(): void {
    this.enrollTarget.set(null);
  }

  markEnrolled(bootcampId: number): void {
    this.myBootcampIds.update((ids) => new Set(ids).add(bootcampId));
  }
}
