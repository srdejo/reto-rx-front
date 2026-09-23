import { Injectable, inject } from '@angular/core';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { Bootcamp } from '@core/domain/models/bootcamp.model';

export interface CatalogEntry {
  bootcamp: Bootcamp;
}

/** Composes the public bootcamp catalog: every bootcamp available to enroll in. */
@Injectable({ providedIn: 'root' })
export class GetBootcampCatalogUseCase {
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);

  async execute(): Promise<CatalogEntry[]> {
    const bootcamps = await this.getAllBootcamps.execute();
    return bootcamps.map((bootcamp) => ({ bootcamp }));
  }
}
