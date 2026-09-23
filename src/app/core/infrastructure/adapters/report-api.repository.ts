import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BootcampReport } from '@core/domain/models/report.model';
import { ReportRepository } from '@core/domain/ports/report.repository';

@Injectable({ providedIn: 'root' })
export class ReportApiRepository extends ReportRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.reportApiUrl;

  override async getBootcampReports(): Promise<BootcampReport[]> {
    try {
      const data = await firstValueFrom(this.http.get<BootcampReport[]>(this.baseUrl));
      return data.map((r) => ({
        ...r,
        capacities: (r.capacities ?? []).map((c) => ({ ...c, technologies: c.technologies ?? [] })),
        enrolledPersons: r.enrolledPersons ?? [],
        enrolledCount: r.enrolledCount ?? 0
      }));
    } catch (err) {
      // report-api answers 404 when no report exists yet
      if (err instanceof HttpErrorResponse && err.status === 404) return [];
      throw err;
    }
  }
}
