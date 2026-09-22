import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetBootcampCatalogUseCase, CatalogEntry } from '@core/application/use-cases/get-bootcamp-catalog.use-case';
import { seatsFor } from '@core/domain/models/iteration.model';
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

  protected readonly loading = signal(true);
  protected readonly apiError = signal<string | null>(null);
  protected readonly enrollTarget = signal<Bootcamp | null>(null);
  protected readonly entries = signal<CatalogEntry[]>([]);

  constructor() {
    this.getBootcampCatalog
      .execute()
      .then((entries) => this.entries.set(entries))
      .catch(() => this.apiError.set('No se pudo conectar con el servicio de bootcamps.'))
      .finally(() => this.loading.set(false));
  }

  protected readonly bootCards = computed(() =>
    this.entries().map(({ bootcamp: b, upcomingIteration }) => ({
      bootcamp: b,
      releaseDateText: fmt(b.releaseDate),
      durationText: `${b.durationDays} días`,
      seatsText: upcomingIteration
        ? `Próxima iteración: ${fmt(upcomingIteration.startDate)} · ${seatsFor(upcomingIteration)} cupos`
        : 'Sin cupos abiertos'
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
}
