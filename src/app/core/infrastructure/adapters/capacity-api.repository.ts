import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse, PagedResult } from '@core/domain/models/shared.types';
import { Capacity, CreateCapacityInput } from '@core/domain/models/capacity.model';
import { CapacityRepository, GetCapacitiesPageParams } from '@core/domain/ports/capacity.repository';

@Injectable({ providedIn: 'root' })
export class CapacityApiRepository extends CapacityRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.capApiUrl;

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
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Capacity>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
    );
    return data.content.map((c) => ({ ...c, technologies: c.technologies ?? [] }));
  }

  override async create(input: CreateCapacityInput): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
  }
}
