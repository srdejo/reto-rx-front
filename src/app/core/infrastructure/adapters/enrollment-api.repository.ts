import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Enrollment } from '@core/domain/models/enrollment.model';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';

@Injectable({ providedIn: 'root' })
export class EnrollmentApiRepository extends EnrollmentRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.enrollmentApiUrl;
  private readonly myEnrollmentsUrl = `${environment.personApiUrl}/bootcamp-person`;

  override getAll(): Promise<Enrollment[]> {
    return firstValueFrom(this.http.get<Enrollment[]>(this.baseUrl));
  }

  override async getMyBootcampIds(): Promise<number[]> {
    const mine = await firstValueFrom(this.http.get<{ bootcampId: number }[]>(`${this.myEnrollmentsUrl}/me`));
    return mine.map((e) => e.bootcampId);
  }

  override async removeByBootcamp(bootcampId: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/bootcamp/${bootcampId}`));
  }

  override async enroll(bootcampId: number): Promise<string | null> {
    try {
      await firstValueFrom(this.http.post(`${this.myEnrollmentsUrl}/enroll`, { bootcampId }));
      return null;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'error' in err && (err as { error?: { message?: unknown } }).error?.message;
      return typeof message === 'string' ? message : 'No se pudo completar la inscripción.';
    }
  }
}
