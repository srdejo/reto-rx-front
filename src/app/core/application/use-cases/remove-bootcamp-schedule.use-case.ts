import { Injectable, inject } from '@angular/core';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';

/**
 * Clears enrollments left over for a bootcamp after it has been deleted
 * from the bootcamp catalog.
 */
@Injectable({ providedIn: 'root' })
export class RemoveBootcampScheduleUseCase {
  private readonly enrollmentRepository = inject(EnrollmentRepository);

  async execute(bootcampId: number): Promise<void> {
    await this.enrollmentRepository.removeByBootcamp(bootcampId);
  }
}
