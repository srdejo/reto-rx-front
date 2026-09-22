import { Signal } from '@angular/core';
import { Enrollment } from '@core/domain/models/enrollment.model';

/**
 * Port: how the application layer talks to enrollment storage. There is no
 * backend service for enrollments today, so the only implementation is an
 * in-memory adapter — but callers depend only on this abstraction.
 */
export abstract class EnrollmentRepository {
  abstract list(): Signal<Enrollment[]>;
  abstract enrolledIn(bootcampId: number): Enrollment[];
  abstract removeByBootcamp(bootcampId: number): void;
  abstract activeCountForEmail(email: string): number;
  /** Returns an error message, or null on success. */
  abstract enroll(bootcampId: number, name: string, email: string, birthDate: string): string | null;
}
