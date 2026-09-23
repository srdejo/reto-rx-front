import { BootcampReport } from '@core/domain/models/report.model';

/**
 * Port: how the application layer reads the bootcamp reports.
 */
export abstract class ReportRepository {
  /** Every bootcamp report, or an empty list when none has been generated yet. */
  abstract getBootcampReports(): Promise<BootcampReport[]>;
}
