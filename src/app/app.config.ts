import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { TechnologyRepository } from '@core/domain/ports/technology.repository';
import { TechnologyApiRepository } from '@core/infrastructure/adapters/technology-api.repository';
import { CapacityRepository } from '@core/domain/ports/capacity.repository';
import { CapacityApiRepository } from '@core/infrastructure/adapters/capacity-api.repository';
import { BootcampRepository } from '@core/domain/ports/bootcamp.repository';
import { BootcampApiRepository } from '@core/infrastructure/adapters/bootcamp-api.repository';
import { IterationRepository } from '@core/domain/ports/iteration.repository';
import { InMemoryIterationRepository } from '@core/infrastructure/adapters/in-memory-iteration.repository';
import { EnrollmentRepository } from '@core/domain/ports/enrollment.repository';
import { InMemoryEnrollmentRepository } from '@core/infrastructure/adapters/in-memory-enrollment.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    // Hexagonal wiring: bind each feature's port (abstract repository) to
    // its concrete adapter. Swapping an adapter (e.g. for tests or a future
    // backend) only ever touches this list.
    { provide: TechnologyRepository, useClass: TechnologyApiRepository },
    { provide: CapacityRepository, useClass: CapacityApiRepository },
    { provide: BootcampRepository, useClass: BootcampApiRepository },
    { provide: IterationRepository, useClass: InMemoryIterationRepository },
    { provide: EnrollmentRepository, useClass: InMemoryEnrollmentRepository }
  ]
};
