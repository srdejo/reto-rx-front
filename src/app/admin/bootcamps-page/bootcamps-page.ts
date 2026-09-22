import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BootcampService, BootcampSortKey } from '../../core/bootcamp.service';
import { CapacityService } from '../../core/capacity.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { ToastService } from '../../core/toast.service';
import { Ref } from '../../core/models';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { addDays, fmt } from '../../core/format.util';

@Component({
  selector: 'app-bootcamps-page',
  imports: [FormsModule, Drawer, ConfirmDialog],
  templateUrl: './bootcamps-page.html',
  styleUrl: './bootcamps-page.css'
})
export class BootcampsPage {
  private readonly bootcampService = inject(BootcampService);
  private readonly capacityService = inject(CapacityService);
  private readonly iterationStore = inject(IterationEnrollmentStore);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly sizes = [5, 10, 20];

  protected readonly drawerOpen = signal(false);
  protected readonly viewId = signal<number | null>(null);
  protected readonly submitted = signal(false);
  protected readonly formError = signal('');
  protected readonly pickQ = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly releaseDate = signal('');
  protected readonly durationDays = signal('');
  protected readonly selectedCapIds = signal<number[]>([]);
  protected readonly delId = signal<number | null>(null);

  protected readonly loading = this.bootcampService.loading;
  protected readonly apiError = this.bootcampService.error;
  protected readonly sortKey = this.bootcampService.sortBy;
  protected readonly sortDir = this.bootcampService.direction;
  protected readonly size = this.bootcampService.size;
  protected readonly currentPage = this.bootcampService.page;
  protected readonly totalPages = this.bootcampService.totalPages;

  constructor() {
    this.bootcampService.load();
    this.bootcampService.loadAll();
    this.capacityService.loadAll();
  }

  // Full capacity catalog (not the paginated capacities table) so the picker
  // and delete cascade preview can see capacities beyond the current page.
  private fullCap(id: number) {
    return this.capacityService.allCapacities().find((c) => c.id === id) ?? { technologies: [] as Ref[], description: '' };
  }

  private techsOf(caps: Ref[]) {
    return [...new Map(caps.flatMap((c) => this.fullCap(c.id).technologies).map((t) => [t.id, t])).values()];
  }

  // The API paginates and sorts server-side; the search box only narrows
  // the page that is already loaded (there is no server-side name filter).
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.bootcampService
      .bootcamps()
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .map((b) => ({
        ...b,
        description: b.description || 'Sin descripción',
        releaseDateText: fmt(b.releaseDate),
        durationText: `${b.durationDays} días`,
        enrolledCount: this.iterationStore.enrolledIn(b.id).length,
        chips: b.capacities.map((c) => `${c.name} · ${this.fullCap(c.id).technologies.length}`)
      }));
  });

  protected readonly pageInfo = computed(
    () => `Página ${this.currentPage() + 1} de ${this.totalPages()} · ${this.bootcampService.totalElements()} bootcamps`
  );

  protected readonly capPick = computed(() => {
    const pq = this.pickQ().trim().toLowerCase();
    return this.capacityService
      .allCapacities()
      .filter((c) => !pq || c.name.toLowerCase().includes(pq))
      .map((c) => {
        const on = this.selectedCapIds().includes(c.id);
        return { id: c.id, name: c.name, sub: on ? '✓ Seleccionada' : `${c.technologies.length} tecnologías`, on };
      });
  });

  protected readonly pickCount = computed(() => `${this.selectedCapIds().length} seleccionadas · 1 a 4`);

  protected readonly errors = computed(() => {
    if (!this.submitted()) return { name: '', description: '', releaseDate: '', durationDays: '', ids: '' };
    const name = this.name().trim();
    const description = this.description().trim();
    const ids = this.selectedCapIds().length;
    return {
      name: !name ? 'El nombre es obligatorio.' : name.length > 50 ? 'Máximo 50 caracteres.' : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : '',
      releaseDate: this.releaseDate() ? '' : 'Selecciona una fecha.',
      durationDays: Number(this.durationDays()) > 0 ? '' : 'Ingresa una duración mayor a 0.',
      ids: ids < 1 ? 'Selecciona al menos 1 capacidad.' : ids > 4 ? 'Máximo 4 capacidades.' : ''
    };
  });

  protected readonly viewing = computed(() => {
    const vb = this.bootcampService.allBootcamps().find((b) => b.id === this.viewId());
    if (!vb) return null;
    const techs = this.techsOf(vb.capacities);
    const people = this.iterationStore.enrolledIn(vb.id);
    return {
      id: vb.id,
      name: vb.name,
      description: vb.description || 'Sin descripción',
      range: `${fmt(vb.releaseDate)} → ${fmt(addDays(vb.releaseDate, vb.durationDays))}`,
      duration: `${vb.durationDays} días`,
      stats: [
        { label: 'Capacidades', value: vb.capacities.length },
        { label: 'Tecnologías', value: techs.length },
        { label: 'Inscritos', value: people.length }
      ],
      caps: vb.capacities.map((c) => ({ id: c.id, name: c.name, techs: this.fullCap(c.id).technologies })),
      people
    };
  });

  protected readonly deletePlan = computed(() => {
    const id = this.delId();
    if (id == null) return null;
    const b = this.bootcampService.allBootcamps().find((x) => x.id === id);
    if (!b) return null;
    const others = this.bootcampService.allBootcamps().filter((x) => x.id !== id);
    const shared = (c: Ref) => others.some((o) => o.capacities.some((oc) => oc.id === c.id));
    const capDel = b.capacities.filter((c) => !shared(c));
    const capKeep = b.capacities.filter(shared);
    const delIds = new Set(capDel.map((c) => c.id));
    const remaining = this.capacityService.allCapacities().filter((c) => !delIds.has(c.id));
    const uniqTechs = [...new Map(capDel.flatMap((c) => this.fullCap(c.id).technologies).map((t) => [t.id, t])).values()];
    const techDel = uniqTechs.filter((t) => !remaining.some((c) => c.technologies.some((x) => x.id === t.id)));
    const techKeep = uniqTechs.filter((t) => !techDel.includes(t));
    return { name: b.name, capDel, capKeep, techDel, techKeep, keepList: [...capKeep, ...techKeep] };
  });

  setPage(delta: number): void {
    const next = this.currentPage() + delta;
    if (next >= 0 && next < this.totalPages()) this.bootcampService.load({ page: next });
  }

  setSort(key: BootcampSortKey): void {
    this.bootcampService.load({ page: 0, sortBy: key });
  }

  toggleDir(): void {
    this.bootcampService.load({ page: 0, direction: this.sortDir() === 'asc' ? 'desc' : 'asc' });
  }

  setSize(n: number): void {
    this.bootcampService.load({ page: 0, size: n });
  }

  toggleCap(id: number): void {
    this.selectedCapIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 4 ? ids : [...ids, id]
    );
  }

  openDrawer(): void {
    this.viewId.set(null);
    this.name.set('');
    this.description.set('');
    this.releaseDate.set('');
    this.durationDays.set('');
    this.selectedCapIds.set([]);
    this.pickQ.set('');
    this.submitted.set(false);
    this.formError.set('');
    this.drawerOpen.set(true);
  }

  openView(id: number): void {
    this.viewId.set(id);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.viewId.set(null);
  }

  askDelete(id: number): void {
    this.delId.set(id);
  }

  cancelDelete(): void {
    this.delId.set(null);
  }

  async confirmDelete(): Promise<void> {
    const id = this.delId();
    if (id == null) return;
    const plan = this.deletePlan();
    try {
      await this.bootcampService.remove(id);
      this.iterationStore.removeByBootcamp(id);
      this.delId.set(null);
      this.drawerOpen.set(false);
      this.viewId.set(null);
      this.toast.show(`Bootcamp "${plan?.name}" eliminado`);
    } catch {
      this.delId.set(null);
      this.toast.show('No se pudo eliminar. No se aplicó ningún cambio.');
    }
  }

  async submit(): Promise<void> {
    if (this.viewId() != null) return;
    this.submitted.set(true);
    const e = this.errors();
    if (e.name || e.description || e.releaseDate || e.durationDays || e.ids) return;
    try {
      await this.bootcampService.create({
        name: this.name().trim(),
        description: this.description().trim(),
        releaseDate: this.releaseDate(),
        durationDays: Number(this.durationDays()),
        capacitiesIds: this.selectedCapIds()
      });
      this.toast.show(`Bootcamp "${this.name().trim()}" creado`);
      this.drawerOpen.set(false);
    } catch {
      this.formError.set('No se pudo guardar en la API.');
    }
  }
}
