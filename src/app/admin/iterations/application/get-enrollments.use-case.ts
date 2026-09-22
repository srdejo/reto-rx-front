import { Injectable, inject } from '@angular/core';
import { Enrollment } from '../domain/enrollment.model';
import { EnrollmentRepository } from '../domain/enrollment.repository';

@Injectable({ providedIn: 'root' })
export class GetEnrollmentsUseCase {
  private readonly repository = inject(EnrollmentRepository);

  enrolledIn(bootcampId: number): Enrollment[] {
    return this.repository.enrolledIn(bootcampId);
  }

  activeCountForEmail(email: string): number {
    return this.repository.activeCountForEmail(email);
  }
}
