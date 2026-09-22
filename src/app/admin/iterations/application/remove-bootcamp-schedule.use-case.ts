import { Injectable, inject } from '@angular/core';
import { IterationRepository } from '../domain/iteration.repository';
import { EnrollmentRepository } from '../domain/enrollment.repository';

/**
 * Clears iterations and enrollments left over for a bootcamp after it has
 * been deleted from the bootcamp catalog.
 */
@Injectable({ providedIn: 'root' })
export class RemoveBootcampScheduleUseCase {
  private readonly iterationRepository = inject(IterationRepository);
  private readonly enrollmentRepository = inject(EnrollmentRepository);

  execute(bootcampId: number): void {
    this.iterationRepository.removeByBootcamp(bootcampId);
    this.enrollmentRepository.removeByBootcamp(bootcampId);
  }
}
