import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetBootcampCatalogUseCase, CatalogEntry } from '@core/application/use-cases/get-bootcamp-catalog.use-case';
import { GetEnrollmentsUseCase } from '@core/application/use-cases/get-enrollments.use-case';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { fmt } from '@shared/utils/format.util';
import { EnrollModal } from '@shared/components/enroll-modal/enroll-modal';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, EnrollModal],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  private readonly getBootcampCatalog = inject(GetBootcampCatalogUseCase);
  private readonly getEnrollments = inject(GetEnrollmentsUseCase);

  protected readonly loading = signal(true);
  protected readonly apiError = signal<string | null>(null);
  protected readonly enrollTarget = signal<Bootcamp | null>(null);
  protected readonly entries = signal<CatalogEntry[]>([]);
  private readonly myBootcampIds = signal<ReadonlySet<number>>(new Set());

  constructor() {
    this.getBootcampCatalog
      .execute()
      .then((entries) => this.entries.set(entries))
      .catch(() => this.apiError.set('No se pudo conectar con el servicio de bootcamps.'))
      .finally(() => this.loading.set(false));
    this.getEnrollments.myBootcampIds().then((ids) => this.myBootcampIds.set(new Set(ids)));
  }

  protected readonly bootCards = computed(() =>
    this.entries().map(({ bootcamp: b }) => ({
      bootcamp: b,
      releaseDateText: fmt(b.releaseDate),
      durationText: `${b.durationDays} días`,
      enrolled: this.myBootcampIds().has(b.id)
    }))
  );

  protected readonly countText = computed(() => {
    const n = this.entries().length;
    return `${n} ${n === 1 ? 'bootcamp' : 'bootcamps'}`;
  });

  openEnroll(b: Bootcamp): void {
    this.enrollTarget.set(b);
  }

  closeEnroll(): void {
    this.enrollTarget.set(null);
  }

  markEnrolled(bootcampId: number): void {
    this.myBootcampIds.update((ids) => new Set(ids).add(bootcampId));
  }
}
