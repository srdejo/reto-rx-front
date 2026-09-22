import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse, PagedResult } from '../../../shared/domain/shared.types';
import { Capacity, CreateCapacityInput } from '../domain/capacity.model';
import { CapacityRepository, GetCapacitiesPageParams } from '../domain/capacity.repository';

@Injectable({ providedIn: 'root' })
export class CapacityApiRepository extends CapacityRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.capApiUrl;

  // Cache of the full catalog, used by pickers/cross-feature lookups that
  // need every capacity regardless of the admin table's current page.
  private allCache: Capacity[] | null = null;

  override async getPage(params: GetCapacitiesPageParams): Promise<PagedResult<Capacity>> {
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Capacity>>(
        `${this.baseUrl}?page=${params.page}&size=${params.size}&sortBy=${params.sortBy}&direction=${params.direction}`
      )
    );
    return {
      content: data.content.map((c) => ({ ...c, technologies: c.technologies ?? [] })),
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: Math.max(1, data.totalPages)
    };
  }

  override async getAll(): Promise<Capacity[]> {
    if (this.allCache) return this.allCache;
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Capacity>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
    );
    this.allCache = data.content.map((c) => ({ ...c, technologies: c.technologies ?? [] }));
    return this.allCache;
  }

  override async create(input: CreateCapacityInput): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
    this.allCache = null;
  }
}
