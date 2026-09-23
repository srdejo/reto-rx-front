import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthSession, Credentials, RegisterData } from '@core/domain/models/auth.model';
import { AuthRepository } from '@core/domain/ports/auth.repository';

@Injectable({ providedIn: 'root' })
export class AuthApiRepository extends AuthRepository {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.authApiUrl.replace(/\/$/, '');

  override async login(credentials: Credentials): Promise<AuthSession> {
    return firstValueFrom(this.http.post<AuthSession>(`${this.baseUrl}/login`, credentials));
  }

  override async register(data: RegisterData): Promise<AuthSession> {
    return firstValueFrom(this.http.post<AuthSession>(`${this.baseUrl}/register`, data));
  }
}
