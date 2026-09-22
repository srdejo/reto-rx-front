import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { EnrollInBootcampUseCase } from '@core/application/use-cases/enroll-in-bootcamp.use-case';
import { GetEnrollmentsUseCase } from '@core/application/use-cases/get-enrollments.use-case';
import { addDays, fmt, todayIso } from '@shared/utils/format.util';

@Component({
  selector: 'app-enroll-modal',
  imports: [FormsModule],
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css'
})
export class EnrollModal {
  private readonly enrollInBootcamp = inject(EnrollInBootcampUseCase);
  private readonly getEnrollments = inject(GetEnrollmentsUseCase);

  readonly bootcamp = input<Bootcamp | null>(null);
  readonly closed = output<void>();

  readonly name = signal('');
  readonly email = signal('');
  readonly birthDate = signal('');
  readonly error = signal('');
  readonly done = signal(false);
  readonly todayIso = todayIso();

  readonly range = computed(() => {
    const b = this.bootcamp();
    if (!b) return '';
    return `${fmt(b.releaseDate)} → ${fmt(addDays(b.releaseDate, b.durationDays))}`;
  });

  readonly activeCount = computed(() => `${this.getEnrollments.activeCountForEmail(this.email())} de 5 bootcamps activos`);

  close(): void {
    this.name.set('');
    this.email.set('');
    this.birthDate.set('');
    this.error.set('');
    this.done.set(false);
    this.closed.emit();
  }

  async submit(): Promise<void> {
    const b = this.bootcamp();
    if (!b) return;
    const result = await this.enrollInBootcamp.execute(b.id, this.name(), this.email(), this.birthDate());
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    this.error.set('');
    this.done.set(true);
  }
}
