import { Enrollment } from '@core/domain/models/enrollment.model';

/**
 * Port: how the application layer talks to enrollment storage.
 */
export abstract class EnrollmentRepository {
  abstract getAll(): Promise<Enrollment[]>;
  abstract removeByBootcamp(bootcampId: number): Promise<void>;
  /** Ids of the bootcamps the authenticated person is enrolled in. */
  abstract getMyBootcampIds(): Promise<number[]>;
  /** Enrolls the authenticated person. Returns an error message, or null on success. */
  abstract enroll(bootcampId: number): Promise<string | null>;
}
