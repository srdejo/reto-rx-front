import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepository } from '@core/domain/ports/auth.repository';
import { AuthSession, Credentials, RegisterData, Role } from '@core/domain/models/auth.model';

const STORAGE_KEY = 'auth_session';

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Holds the current auth session in a signal (unlike the other use-cases,
 * which are stateless request/response operations) and mirrors it to
 * localStorage so the session survives a page reload.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authRepository = inject(AuthRepository);
  private readonly router = inject(Router);

  private readonly _session = signal<AuthSession | null>(readStoredSession());
  readonly session = this._session.asReadonly();

  async login(credentials: Credentials): Promise<void> {
    const session = await this.authRepository.login(credentials);
    this.storeSession(session);
  }

  async register(data: RegisterData): Promise<void> {
    const session = await this.authRepository.register(data);
    this.storeSession(session);
  }

  private storeSession(session: AuthSession): void {
    this._session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  logout(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigateByUrl('/login');
  }

  isAuthenticated(): boolean {
    return this._session() !== null;
  }

  getRole(): Role | null {
    return this._session()?.role ?? null;
  }

  getToken(): string | null {
    return this._session()?.token ?? null;
  }
}
