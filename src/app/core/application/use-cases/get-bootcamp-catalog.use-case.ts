import { Injectable, inject } from '@angular/core';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { GetIterationsForBootcampUseCase } from '@core/application/use-cases/get-iterations-for-bootcamp.use-case';
import { seatsFor } from '@core/domain/models/iteration.model';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { Iteration } from '@core/domain/models/iteration.model';

export interface CatalogEntry {
  bootcamp: Bootcamp;
  upcomingIteration: Iteration | null;
}

/**
 * Composes the public bootcamp catalog: every bootcamp paired with its
 * soonest iteration that still has open seats (if any).
 */
@Injectable({ providedIn: 'root' })
export class GetBootcampCatalogUseCase {
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);
  private readonly getIterationsForBootcamp = inject(GetIterationsForBootcampUseCase);

  async execute(): Promise<CatalogEntry[]> {
    const bootcamps = await this.getAllBootcamps.execute();
    return bootcamps.map((bootcamp) => {
      const upcomingIteration =
        this.getIterationsForBootcamp
          .execute(bootcamp.id)
          .filter((i) => seatsFor(i) > 0)
          .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
      return { bootcamp, upcomingIteration };
    });
  }
}
