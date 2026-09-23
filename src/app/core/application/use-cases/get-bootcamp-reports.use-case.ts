import { Injectable, inject } from '@angular/core';
import { BootcampReport } from '@core/domain/models/report.model';
import { ReportRepository } from '@core/domain/ports/report.repository';

/** Loads the bootcamp reports (info, capacities, technologies and enrolled persons) for the admin dashboard. */
@Injectable({ providedIn: 'root' })
export class GetBootcampReportsUseCase {
  private readonly repository = inject(ReportRepository);

  execute(): Promise<BootcampReport[]> {
    return this.repository.getBootcampReports();
  }
}
