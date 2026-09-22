import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bootcamp, PagedResponse, SortDirection } from './models';

export type BootcampSortKey = 'name' | 'capacityCount';

@Injectable({ providedIn: 'root' })
export class BootcampService {
  private readonly http = inject(HttpClient);
  // the bootcamp-api endpoints are mapped at a trailing "/"
  private readonly baseUrl = `${environment.bootApiUrl.replace(/\/$/, '')}/`;

  readonly bootcamps = signal<Bootcamp[]>([]);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly sortBy = signal<BootcampSortKey>('name');
  readonly direction = signal<SortDirection>('asc');
  readonly totalElements = signal(0);
  readonly totalPages = signal(1);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Full unpaginated list, used internally by the public catalog (which
  // lists every bootcamp), bootcamp lookup by id, and the iteration/delete
  // pickers that need every bootcamp regardless of the admin table's page.
  readonly allBootcamps = signal<Bootcamp[]>([]);
  readonly allLoading = signal(false);
  readonly allError = signal<string | null>(null);
  private allLoaded = false;

  async loadAll(): Promise<void> {
    if (this.allLoaded) return;
    this.allLoading.set(true);
    this.allError.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<PagedResponse<Bootcamp>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
      );
      this.allBootcamps.set(data.content.map((b) => ({ ...b, capacities: b.capacities ?? [] })));
      this.allLoaded = true;
    } catch {
      this.allError.set('No se pudo conectar con el servicio de bootcamps.');
    } finally {
      this.allLoading.set(false);
    }
  }

  async load(params?: { page?: number; size?: number; sortBy?: BootcampSortKey; direction?: SortDirection }): Promise<void> {
    const page = params?.page ?? this.page();
    const size = params?.size ?? this.size();
    const sortBy = params?.sortBy ?? this.sortBy();
    const direction = params?.direction ?? this.direction();

    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<PagedResponse<Bootcamp>>(
          `${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
        )
      );
      this.bootcamps.set(data.content.map((b) => ({ ...b, capacities: b.capacities ?? [] })));
      this.page.set(data.page);
      this.size.set(data.size);
      this.sortBy.set(sortBy);
      this.direction.set(direction);
      this.totalElements.set(data.totalElements);
      this.totalPages.set(Math.max(1, data.totalPages));
    } catch {
      this.error.set('No se pudo conectar con el servicio de bootcamps.');
    } finally {
      this.loading.set(false);
    }
  }

  async create(body: {
    name: string;
    description: string;
    releaseDate: string;
    durationDays: number;
    capacitiesIds: number[];
  }): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, body));
    this.allLoaded = false;
    await Promise.all([this.load({ page: 0 }), this.loadAll()]);
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}${id}`));
    this.allLoaded = false;
    await Promise.all([this.load(), this.loadAll()]);
  }
}
