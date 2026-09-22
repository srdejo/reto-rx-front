import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetCapacitiesUseCase } from '../../application/get-capacities.use-case';
import { CreateCapacityUseCase } from '../../application/create-capacity.use-case';
import { GetTechnologiesUseCase } from '../../../technologies/application/get-technologies.use-case';
import { Capacity, CapacitySortKey } from '../../domain/capacity.model';
import { Technology } from '../../../technologies/domain/technology.model';
import { SortDirection } from '../../../../shared/domain/shared.types';
import { ToastService } from '../../../../shared/data-access/toast.service';
import { Drawer } from '../../../../shared/ui/drawer/drawer';

@Component({
  selector: 'app-capacities-page',
  imports: [FormsModule, Drawer],
  templateUrl: './capacities-page.html',
  styleUrl: './capacities-page.css'
})
export class CapacitiesPage {
  private readonly getCapacities = inject(GetCapacitiesUseCase);
  private readonly createCapacity = inject(CreateCapacityUseCase);
  private readonly getTechnologies = inject(GetTechnologiesUseCase);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly sizes = [5, 10, 20];

  protected readonly drawerOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal('');
  protected readonly pickQ = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly selectedTechIds = signal<number[]>([]);
  protected readonly errors = signal({ name: '', description: '', ids: '' });

  protected readonly capacities = signal<Capacity[]>([]);
  protected readonly technologies = signal<Technology[]>([]);
  protected readonly sortKey = signal<CapacitySortKey>('name');
  protected readonly sortDir = signal<SortDirection>('asc');
  protected readonly size = signal(10);
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly totalElements = signal(0);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  constructor() {
    this.load();
    this.getTechnologies.execute().then((t) => this.technologies.set(t));
  }

  private async load(params?: { page?: number; size?: number; sortBy?: CapacitySortKey; direction?: SortDirection }): Promise<void> {
    const page = params?.page ?? this.currentPage();
    const size = params?.size ?? this.size();
    const sortBy = params?.sortBy ?? this.sortKey();
    const direction = params?.direction ?? this.sortDir();

    this.loading.set(true);
    this.apiError.set(null);
    try {
      const result = await this.getCapacities.execute({ page, size, sortBy, direction });
      this.capacities.set(result.content);
      this.currentPage.set(result.page);
      this.size.set(result.size);
      this.sortKey.set(sortBy);
      this.sortDir.set(direction);
      this.totalElements.set(result.totalElements);
      this.totalPages.set(result.totalPages);
    } catch {
      this.apiError.set('No se pudo conectar con el servicio de capacidades.');
    } finally {
      this.loading.set(false);
    }
  }

  // The API paginates and sorts server-side; the search box only narrows
  // the page that is already loaded (there is no server-side name filter).
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.capacities()
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({ ...c, description: c.description || 'Sin descripción' }));
  });

  protected readonly pageInfo = computed(
    () => `Página ${this.currentPage() + 1} de ${this.totalPages()} · ${this.totalElements()} capacidades`
  );

  protected readonly techPick = computed(() => {
    const pq = this.pickQ().trim().toLowerCase();
    return this.technologies()
      .filter((t) => !pq || t.name.toLowerCase().includes(pq))
      .map((t) => ({ id: t.id, name: t.name, on: this.selectedTechIds().includes(t.id) }));
  });

  protected readonly pickCount = computed(() => `${this.selectedTechIds().length} seleccionadas · 3 a 20`);

  setPage(delta: number): void {
    const next = this.currentPage() + delta;
    if (next >= 0 && next < this.totalPages()) this.load({ page: next });
  }

  setSort(key: CapacitySortKey): void {
    this.load({ page: 0, sortBy: key });
  }

  toggleDir(): void {
    this.load({ page: 0, direction: this.sortDir() === 'asc' ? 'desc' : 'asc' });
  }

  setSize(n: number): void {
    this.load({ page: 0, size: n });
  }

  toggleTech(id: number): void {
    this.selectedTechIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 20 ? ids : [...ids, id]
    );
  }

  openDrawer(): void {
    this.name.set('');
    this.description.set('');
    this.selectedTechIds.set([]);
    this.pickQ.set('');
    this.submitted.set(false);
    this.formError.set('');
    this.errors.set({ name: '', description: '', ids: '' });
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    const result = await this.createCapacity.execute({
      name: this.name(),
      description: this.description(),
      technologyIds: this.selectedTechIds()
    });
    if (result.ok) {
      this.toast.show(`Capacidad "${this.name().trim()}" creada`);
      this.drawerOpen.set(false);
      await this.load({ page: 0 });
      return;
    }
    if ('errors' in result) {
      this.errors.set(result.errors);
      return;
    }
    this.formError.set(result.apiError);
  }
}
