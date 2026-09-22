import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bootcamp } from '../../../core/models';
import { IterationEnrollmentStore } from '../../../core/iteration-enrollment.store';
import { BootcampService } from '../../../core/bootcamp.service';
import { addDays, fmt, isEmail, todayIso } from '../../../core/format.util';

@Component({
  selector: 'app-enroll-modal',
  imports: [FormsModule],
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css'
})
export class EnrollModal {
  private readonly store = inject(IterationEnrollmentStore);
  private readonly bootcampService = inject(BootcampService);

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

  readonly activeCount = computed(() => `${this.store.activeCountForEmail(this.email())} de 5 bootcamps activos`);

  close(): void {
    this.name.set('');
    this.email.set('');
    this.birthDate.set('');
    this.error.set('');
    this.done.set(false);
    this.closed.emit();
  }

  submit(): void {
    const b = this.bootcamp();
    if (!b) return;
    const name = this.name().trim();
    const email = this.email().trim().toLowerCase();
    if (!name || !isEmail(email)) {
      this.error.set('Ingresa tu nombre y un correo válido.');
      return;
    }
    const birthDate = this.birthDate();
    if (!birthDate) {
      this.error.set('Ingresa tu fecha de nacimiento.');
      return;
    }
    if (birthDate >= todayIso()) {
      this.error.set('La fecha de nacimiento debe ser anterior a hoy.');
      return;
    }
    const end = (bootcampId: number) => {
      const other = this.bootcampService.allBootcamps().find((x) => x.id === bootcampId);
      return other ? addDays(other.releaseDate, other.durationDays) : '';
    };
    const bEnd = addDays(b.releaseDate, b.durationDays);
    const mine = this.store.enrollments().filter((e) => e.email.toLowerCase() === email);
    const clash = mine
      .map((e) => this.bootcampService.allBootcamps().find((x) => x.id === e.bootcampId))
      .filter((x): x is Bootcamp => !!x)
      .find((x) => x.releaseDate < bEnd && b.releaseDate < end(x.id));
    if (clash) {
      this.error.set(
        `Las fechas se cruzan con ${clash.name} (${fmt(clash.releaseDate)} → ${fmt(end(clash.id))}).`
      );
      return;
    }
    const err = this.store.enroll(b.id, () => '', name, email, birthDate);
    if (err) {
      this.error.set(err);
      return;
    }
    this.error.set('');
    this.done.set(true);
  }
}
