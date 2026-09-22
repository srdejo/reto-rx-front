import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapacityService, CapacitySortKey } from '../../core/capacity.service';
import { TechnologyService } from '../../core/technology.service';
import { ToastService } from '../../core/toast.service';
import { Drawer } from '../../shared/ui/drawer/drawer';

@Component({
  selector: 'app-capacities-page',
  imports: [FormsModule, Drawer],
  templateUrl: './capacities-page.html',
  styleUrl: './capacities-page.css'
})
export class CapacitiesPage {
  private readonly capacityService = inject(CapacityService);
  private readonly technologyService = inject(TechnologyService);
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

  protected readonly loading = this.capacityService.loading;
  protected readonly apiError = this.capacityService.error;
  protected readonly sortKey = this.capacityService.sortBy;
  protected readonly sortDir = this.capacityService.direction;
  protected readonly size = this.capacityService.size;
  protected readonly currentPage = this.capacityService.page;
  protected readonly totalPages = this.capacityService.totalPages;

  constructor() {
    this.capacityService.load();
    this.capacityService.loadAll();
  }

  // The API paginates and sorts server-side; the search box only narrows
  // the page that is already loaded (there is no server-side name filter).
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.capacityService
      .capacities()
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({ ...c, description: c.description || 'Sin descripción' }));
  });

  protected readonly pageInfo = computed(
    () => `Página ${this.currentPage() + 1} de ${this.totalPages()} · ${this.capacityService.totalElements()} capacidades`
  );

  protected readonly techPick = computed(() => {
    const pq = this.pickQ().trim().toLowerCase();
    return this.technologyService
      .technologies()
      .filter((t) => !pq || t.name.toLowerCase().includes(pq))
      .map((t) => ({ id: t.id, name: t.name, on: this.selectedTechIds().includes(t.id) }));
  });

  protected readonly pickCount = computed(() => `${this.selectedTechIds().length} seleccionadas · 3 a 20`);

  protected readonly errors = computed(() => {
    if (!this.submitted()) return { name: '', description: '', ids: '' };
    const name = this.name().trim();
    const description = this.description().trim();
    const dup = this.capacityService.allCapacities().some((c) => c.name.toLowerCase() === name.toLowerCase());
    const ids = this.selectedTechIds().length;
    return {
      name: !name ? 'El nombre es obligatorio.' : name.length > 50 ? 'Máximo 50 caracteres.' : dup ? 'Ya existe una capacidad con ese nombre.' : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : '',
      ids: ids < 3 ? 'Selecciona al menos 3 tecnologías.' : ids > 20 ? 'Máximo 20 tecnologías.' : ''
    };
  });

  setPage(delta: number): void {
    const next = this.currentPage() + delta;
    if (next >= 0 && next < this.totalPages()) this.capacityService.load({ page: next });
  }

  setSort(key: CapacitySortKey): void {
    this.capacityService.load({ page: 0, sortBy: key });
  }

  toggleDir(): void {
    this.capacityService.load({ page: 0, direction: this.sortDir() === 'asc' ? 'desc' : 'asc' });
  }

  setSize(n: number): void {
    this.capacityService.load({ page: 0, size: n });
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
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    const e = this.errors();
    if (e.name || e.description || e.ids) return;
    try {
      await this.capacityService.create({
        name: this.name().trim(),
        description: this.description().trim(),
        technologyIds: this.selectedTechIds()
      });
      this.toast.show(`Capacidad "${this.name().trim()}" creada`);
      this.drawerOpen.set(false);
    } catch {
      this.formError.set('No se pudo guardar en la API.');
    }
  }
}
