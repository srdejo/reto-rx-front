import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse, PagedResult } from '@core/domain/models/shared.types';
import { Bootcamp, CreateBootcampInput } from '@core/domain/models/bootcamp.model';
import { BootcampRepository, GetBootcampsPageParams } from '@core/domain/ports/bootcamp.repository';

@Injectable({ providedIn: 'root' })
export class BootcampApiRepository extends BootcampRepository {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = `${environment.bootApiUrl.replace(/\/$/, '')}/`;

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
    const data = await firstValueFrom(
      this.http.get<PagedResponse<Bootcamp>>(`${this.baseUrl}?page=0&size=1000&sortBy=name&direction=asc`)
    );
    return data.content.map((b) => ({ ...b, capacities: b.capacities ?? [] }));
  }

  override async create(input: CreateBootcampInput): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
  }

  override async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.baseUrl}${id}`));
  }
}
