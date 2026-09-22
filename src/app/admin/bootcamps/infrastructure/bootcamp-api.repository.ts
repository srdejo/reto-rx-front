import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse, PagedResult } from '../../../shared/domain/shared.types';
import { Bootcamp, CreateBootcampInput } from '../domain/bootcamp.model';
import { BootcampRepository, GetBootcampsPageParams } from '../domain/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class BootcampApiRepository extends BootcampRepository {
  private readonly http = inject(HttpClient);
  // the bootcamp-api endpoints are mapped at a trailing "/"
  private readonly baseUrl = `${environment.bootApiUrl.replace(/\/$/, '')}/`;

  // Cache of the full catalog, used by the public listing and pickers that
  // need every bootcamp regardless of the admin table's current page.
  private allCache: Bootcamp[] | null = null;

  override async getPage(params: GetBootcampsPageParams): Promise<PagedResult<Bootcamp>> {
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Bootcamp>>(
        `${this.baseUrl}?page=${params.page}&size=${params.size}&sortBy=${params.sortBy}&direction=${params.direction}`
      )
    );
    return {
      content: data.content.map((b) => ({ ...b, capacities: b.capacities ?? [] })),
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: Math.max(1, data.totalPages)
    };
  }

  override async getAll(): Promise<Bootcamp[]> {
    if (this.allCache) return this.allCache;
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Bootcamp>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
    );
    this.allCache = data.content.map((b) => ({ ...b, capacities: b.capacities ?? [] }));
    return this.allCache;
  }

  override async create(input: CreateBootcampInput): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
    this.allCache = null;
  }

  override async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}${id}`));
    this.allCache = null;
  }
}
