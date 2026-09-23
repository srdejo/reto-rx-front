import { Injectable, inject } from '@angular/core';
import { Enrollment } from '@core/domain/models/enrollment.model';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';

@Injectable({ providedIn: 'root' })
export class GetEnrollmentsUseCase {
  private readonly repository = inject(EnrollmentRepository);

  list(): Promise<Enrollment[]> {
    return this.repository.getAll();
  }

  async enrolledIn(bootcampId: number): Promise<Enrollment[]> {
    const all = await this.repository.getAll();
    return all.filter((e) => e.bootcampId === bootcampId);
  }

  /** Ids of the bootcamps the logged-in person is enrolled in (empty if the request fails). */
  myBootcampIds(): Promise<number[]> {
    return this.repository.getMyBootcampIds().catch(() => []);
  }
}
