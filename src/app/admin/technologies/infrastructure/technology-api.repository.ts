import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateTechnologyInput, Technology } from '../domain/technology.model';
import { TechnologyRepository } from '../domain/technology.repository';

@Injectable({ providedIn: 'root' })
export class TechnologyApiRepository extends TechnologyRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.techApiUrl;

  override getAll(): Promise<Technology[]> {
    return firstValueFrom(this.http.get<Technology[]>(this.baseUrl));
  }

  override async create(input: CreateTechnologyInput): Promise<void> {
    await firstValueFrom(this.http.post(this.baseUrl, input));
  }
}
