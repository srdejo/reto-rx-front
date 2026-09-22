import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BootcampService } from '../../core/bootcamp.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { Bootcamp } from '../../core/models';
import { fmt } from '../../core/format.util';
import { EnrollModal } from '../../shared/ui/enroll-modal/enroll-modal';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, EnrollModal],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  private readonly bootcampService = inject(BootcampService);
  private readonly iterationStore = inject(IterationEnrollmentStore);

  protected readonly loading = this.bootcampService.allLoading;
  protected readonly apiError = this.bootcampService.allError;
  protected readonly enrollTarget = signal<Bootcamp | null>(null);

  protected readonly bootCards = computed(() =>
    this.bootcampService.allBootcamps().map((b) => {
      const upcoming = this.iterationStore
        .iterationsFor(b.id)
        .filter((i) => this.iterationStore.seatsFor(i) > 0)
        .sort((a, c) => a.startDate.localeCompare(c.startDate))[0];
      return {
        bootcamp: b,
        releaseDateText: fmt(b.releaseDate),
        durationText: `${b.durationDays} días`,
        seatsText: upcoming
          ? `Próxima iteración: ${fmt(upcoming.startDate)} · ${this.iterationStore.seatsFor(upcoming)} cupos`
          : 'Sin cupos abiertos'
      };
    })
  );

  protected readonly countText = computed(() => {
    const n = this.bootcampService.allBootcamps().length;
    return `${n} ${n === 1 ? 'bootcamp' : 'bootcamps'}`;
  });

  openEnroll(b: Bootcamp): void {
    this.enrollTarget.set(b);
  }

  closeEnroll(): void {
    this.enrollTarget.set(null);
  }
}
