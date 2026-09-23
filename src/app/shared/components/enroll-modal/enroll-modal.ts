import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { EnrollInBootcampUseCase } from '@core/application/use-cases/enroll-in-bootcamp.use-case';
import { addDays, fmt } from '@shared/utils/format.util';

@Component({
  selector: 'app-enroll-modal',
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css'
})
export class EnrollModal {
  private readonly enrollInBootcamp = inject(EnrollInBootcampUseCase);

  readonly bootcamp = input<Bootcamp | null>(null);
  readonly closed = output<void>();
  /** Emits the bootcamp id once the enrollment succeeds. */
  readonly enrolled = output<number>();

  readonly error = signal('');
  readonly done = signal(false);
  readonly submitting = signal(false);

  readonly range = computed(() => {
    const b = this.bootcamp();
    if (!b) return '';
    return `${fmt(b.releaseDate)} → ${fmt(addDays(b.releaseDate, b.durationDays))}`;
  });

  close(): void {
    this.error.set('');
    this.done.set(false);
    this.submitting.set(false);
    this.closed.emit();
  }

  async submit(): Promise<void> {
    const b = this.bootcamp();
    if (!b || this.submitting()) return;
    this.submitting.set(true);
    const result = await this.enrollInBootcamp.execute(b.id);
    this.submitting.set(false);
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    this.error.set('');
    this.done.set(true);
    this.enrolled.emit(b.id);
  }
}
