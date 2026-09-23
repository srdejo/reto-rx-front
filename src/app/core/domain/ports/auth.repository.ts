import { AuthSession, Credentials, RegisterData } from '@core/domain/models/auth.model';

/**
 * Port: how the application layer authenticates a user,
 * regardless of what infrastructure implements it.
 */
export abstract class AuthRepository {
  abstract login(credentials: Credentials): Promise<AuthSession>;
  abstract register(data: RegisterData): Promise<AuthSession>;
}
