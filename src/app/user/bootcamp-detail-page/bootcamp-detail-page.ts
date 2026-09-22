import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BootcampService } from '../../core/bootcamp.service';
import { CapacityService } from '../../core/capacity.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { Bootcamp } from '../../core/models';
import { addDays, fmt } from '../../core/format.util';
import { EnrollModal } from '../../shared/ui/enroll-modal/enroll-modal';

@Component({
  selector: 'app-bootcamp-detail-page',
  imports: [RouterLink, EnrollModal],
  templateUrl: './bootcamp-detail-page.html',
  styleUrl: './bootcamp-detail-page.css'
})
export class BootcampDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly bootcampService = inject(BootcampService);
  private readonly capacityService = inject(CapacityService);
  private readonly iterationStore = inject(IterationEnrollmentStore);

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: NaN });

  protected readonly loading = this.bootcampService.allLoading;
  protected readonly enrollTarget = signal<Bootcamp | null>(null);

  private readonly bootcamp = computed(() => this.bootcampService.allBootcamps().find((b) => b.id === this.id()) ?? null);
  protected readonly notFound = computed(() => !this.loading() && !this.bootcamp());

  private fullCap(id: number) {
    return this.capacityService.allCapacities().find((c) => c.id === id) ?? { description: '', technologies: [] };
  }

  protected readonly detail = computed(() => {
    const b = this.bootcamp();
    if (!b) return null;
    const iters = this.iterationStore
      .iterationsFor(b.id)
      .sort((a, c) => a.startDate.localeCompare(c.startDate))
      .map((i) => {
        const seats = this.iterationStore.seatsFor(i);
        return { date: fmt(i.startDate), seatsText: seats > 0 ? `${seats} cupos` : 'Cupo lleno', full: seats <= 0 };
      });
    return {
      bootcamp: b,
      releaseDateText: fmt(b.releaseDate),
      durationText: `${b.durationDays} días`,
      range: `${fmt(b.releaseDate)} → ${fmt(addDays(b.releaseDate, b.durationDays))}`,
      capBlocks: b.capacities.map((c) => {
        const full = this.fullCap(c.id);
        return { name: c.name, description: full.description, techs: full.technologies };
      }),
      iters,
      enrolledText: `${this.iterationStore.enrolledIn(b.id).length} personas inscritas`
    };
  });

  openEnroll(): void {
    if (this.bootcamp()) this.enrollTarget.set(this.bootcamp());
  }

  closeEnroll(): void {
    this.enrollTarget.set(null);
  }
}
