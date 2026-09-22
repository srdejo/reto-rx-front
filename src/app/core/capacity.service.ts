import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Capacity, PagedResponse, SortDirection } from './models';

export type CapacitySortKey = 'name' | 'technologyCount';

@Injectable({ providedIn: 'root' })
export class CapacityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.capApiUrl;

  readonly capacities = signal<Capacity[]>([]);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly sortBy = signal<CapacitySortKey>('name');
  readonly direction = signal<SortDirection>('asc');
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Full unpaginated list, used internally where every capacity is needed
  // (bootcamp capacity picker, delete cascade preview) regardless of the
  // paginated page currently shown in the capacities table.
  readonly allCapacities = signal<Capacity[]>([]);
  private allLoaded = false;

  async loadAll(): Promise<void> {
    if (this.allLoaded) return;
    try {
      const data = await firstValueFrom(
        this.http.get<PagedResponse<Capacity>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
      );
      this.allCapacities.set(data.content.map((c) => ({ ...c, technologies: c.technologies ?? [] })));
      this.allLoaded = true;
    } catch {
      // leave allCapacities empty; callers fall back gracefully
    }
  }

  async load(params?: { page?: number; size?: number; sortBy?: CapacitySortKey; direction?: SortDirection }): Promise<void> {
    const page = params?.page ?? this.page();
    const size = params?.size ?? this.size();
    const sortBy = params?.sortBy ?? this.sortBy();
    const direction = params?.direction ?? this.direction();

    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<PagedResponse<Capacity>>(
          `${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
        )
      );
      this.capacities.set(data.content.map((c) => ({ ...c, technologies: c.technologies ?? [] })));
      this.page.set(data.page);
      this.size.set(data.size);
      this.sortBy.set(sortBy);
      this.direction.set(direction);
      this.totalElements.set(data.totalElements);
      this.totalPages.set(Math.max(1, data.totalPages));
    } catch {
      this.error.set('No se pudo conectar con el servicio de capacidades.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(body: { name: string; description: string; technologyIds: number[] }): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, body));
    this.allLoaded = false;
    await Promise.all([this.load({ page: 0 }), this.loadAll()]);
  }
}
