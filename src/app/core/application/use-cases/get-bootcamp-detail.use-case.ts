import { Injectable, inject } from '@angular/core';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { GetAllCapacitiesUseCase } from '@core/application/use-cases/get-all-capacities.use-case';
import { GetIterationsForBootcampUseCase } from '@core/application/use-cases/get-iterations-for-bootcamp.use-case';
import { GetEnrollmentsUseCase } from '@core/application/use-cases/get-enrollments.use-case';
import { Bootcamp } from '@core/domain/models/bootcamp.model';
import { Iteration } from '@core/domain/models/iteration.model';
import { Ref } from '@core/domain/models/shared.types';

export interface CapacityDetail {
  name: string;
  description: string;
  techs: Ref[];
}

export interface BootcampDetail {
  bootcamp: Bootcamp;
  capacityDetails: CapacityDetail[];
  iterations: Iteration[];
  enrolledCount: number;
}

/** Composes everything the public bootcamp detail page needs for one bootcamp id. */
@Injectable({ providedIn: 'root' })
export class GetBootcampDetailUseCase {
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);
  private readonly getAllCapacities = inject(GetAllCapacitiesUseCase);
  private readonly getIterationsForBootcamp = inject(GetIterationsForBootcampUseCase);
  private readonly getEnrollments = inject(GetEnrollmentsUseCase);

  async execute(bootcampId: number): Promise<BootcampDetail | null> {
    const [bootcamps, capacities] = await Promise.all([this.getAllBootcamps.execute(), this.getAllCapacities.execute()]);
    const bootcamp = bootcamps.find((b) => b.id === bootcampId);
    if (!bootcamp) return null;

    const capacityDetails = bootcamp.capacities.map((c) => {
      const full = capacities.find((x) => x.id === c.id);
      return { name: c.name, description: full?.description ?? '', techs: full?.technologies ?? [] };
    });
    const iterations = this.getIterationsForBootcamp
      .execute(bootcamp.id)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return {
      bootcamp,
      capacityDetails,
      iterations,
      enrolledCount: this.getEnrollments.enrolledIn(bootcamp.id).length
    };
  }
}
