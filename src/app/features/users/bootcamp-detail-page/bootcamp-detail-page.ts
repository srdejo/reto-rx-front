import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GetBootcampDetailUseCase, BootcampDetail } from '@core/application/use-cases/get-bootcamp-detail.use-case';
import { seatsFor } from '@core/domain/models/iteration.model';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
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

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: NaN });

  protected readonly loading = signal(true);
  protected readonly enrollTarget = signal<Bootcamp | null>(null);
  protected readonly detailData = signal<BootcampDetail | null>(null);

  constructor() {
    effect(() => {
      this.load(this.id());
    });
  }

  private async load(bootcampId: number): Promise<void> {
    this.loading.set(true);
    this.detailData.set(await this.getBootcampDetail.execute(bootcampId));
    this.loading.set(false);
  }

  protected readonly notFound = computed(() => !this.loading() && !this.detailData());

  protected readonly detail = computed(() => {
    const d = this.detailData();
    if (!d) return null;
    const b = d.bootcamp;
    return {
      bootcamp: b,
      releaseDateText: fmt(b.releaseDate),
      durationText: `${b.durationDays} días`,
      range: `${fmt(b.releaseDate)} → ${fmt(addDays(b.releaseDate, b.durationDays))}`,
      capBlocks: d.capacityDetails,
      iters: d.iterations.map((i) => {
        const seats = seatsFor(i);
        return { date: fmt(i.startDate), seatsText: seats > 0 ? `${seats} cupos` : 'Cupo lleno', full: seats <= 0 };
      }),
      enrolledText: `${d.enrolledCount} personas inscritas`
    };
  });

  openEnroll(): void {
    const b = this.detailData()?.bootcamp;
    if (b) this.enrollTarget.set(b);
  }

  closeEnroll(): void {
    this.enrollTarget.set(null);
  }
}
