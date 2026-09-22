import { CreateTechnologyInput, Technology } from '@core/domain/models/technology.model';

/**
 * Port: how the application layer talks to technology storage,
 * regardless of what infrastructure implements it.
 */
export abstract class TechnologyRepository {
  abstract getAll(): Promise<Technology[]>;
  abstract create(input: CreateTechnologyInput): Promise<void>;
}
