import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Technology } from './models';

@Injectable({ providedIn: 'root' })
export class TechnologyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.techApiUrl;

  readonly technologies = signal<Technology[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<Technology[]>(this.baseUrl));
      this.technologies.set(data);
    } catch {
      this.error.set('No se pudo conectar con el servicio de tecnologías.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(body: { name: string; description: string }): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, body));
    await this.load();
  }
}
