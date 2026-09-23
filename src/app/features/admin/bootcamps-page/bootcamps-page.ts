import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetBootcampsUseCase } from '@core/application/use-cases/get-bootcamps.use-case';
import { GetAllBootcampsUseCase } from '@core/application/use-cases/get-all-bootcamps.use-case';
import { CreateBootcampUseCase } from '@core/application/use-cases/create-bootcamp.use-case';
import { DeleteBootcampUseCase } from '@core/application/use-cases/delete-bootcamp.use-case';
import { GetAllCapacitiesUseCase } from '@core/application/use-cases/get-all-capacities.use-case';
import { GetEnrollmentsUseCase } from '@core/application/use-cases/get-enrollments.use-case';
import { RemoveBootcampScheduleUseCase } from '@core/application/use-cases/remove-bootcamp-schedule.use-case';
import { Bootcamp, BootcampSortKey } from '@core/domain/models/bootcamp.model';
import { Capacity } from '@core/domain/models/capacity.model';
import { Enrollment } from '@core/domain/models/enrollment.model';
import { Ref, SortDirection } from '@core/domain/models/shared.types';
import { ToastService } from '@shared/components/toast/toast.service';
import { Drawer } from '@shared/components/drawer/drawer';
import { ConfirmDialog } from '@shared/components/confirm-dialog/confirm-dialog';
import { addDays, fmt } from '@shared/utils/format.util';

@Component({
  selector: 'app-bootcamps-page',
  imports: [FormsModule, Drawer, ConfirmDialog],
  templateUrl: './bootcamps-page.html',
  styleUrl: './bootcamps-page.css'
})
export class BootcampsPage {
  private readonly getBootcamps = inject(GetBootcampsUseCase);
  private readonly getAllBootcamps = inject(GetAllBootcampsUseCase);
  private readonly createBootcamp = inject(CreateBootcampUseCase);
  private readonly deleteBootcamp = inject(DeleteBootcampUseCase);
  private readonly getAllCapacities = inject(GetAllCapacitiesUseCase);
  private readonly getEnrollments = inject(GetEnrollmentsUseCase);
  private readonly removeBootcampSchedule = inject(RemoveBootcampScheduleUseCase);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly sizes = [5, 10, 20];

  protected readonly drawerOpen = signal(false);
  protected readonly viewId = signal<number | null>(null);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly formError = signal('');
  protected readonly pickQ = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly releaseDate = signal('');
  protected readonly durationDays = signal('');
  protected readonly selectedCapIds = signal<number[]>([]);
  protected readonly delId = signal<number | null>(null);
  protected readonly errors = signal({ name: '', description: '', releaseDate: '', durationDays: '', ids: '' });

  protected readonly bootcamps = signal<Bootcamp[]>([]);
  protected readonly allBootcamps = signal<Bootcamp[]>([]);
  protected readonly allCapacities = signal<Capacity[]>([]);
  protected readonly enrollments = signal<Enrollment[]>([]);
  protected readonly sortKey = signal<BootcampSortKey>('name');
  protected readonly sortDir = signal<SortDirection>('asc');
  protected readonly size = signal(10);
  protected readonly currentPage = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly totalElements = signal(0);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  constructor() {
    this.load();
    this.refreshLookups();
  }

  private async refreshLookups(): Promise<void> {
    // Fetched independently: the enrollments backend isn't wired up yet, and
    // a failure there shouldn't take down the bootcamps/capacities lookups.
    const [allResult, capsResult, enrollmentsResult] = await Promise.allSettled([
      this.getAllBootcamps.execute(),
      this.getAllCapacities.execute(),
      this.getEnrollments.list()
    ]);
    if (allResult.status === 'fulfilled') this.allBootcamps.set(allResult.value);
    if (capsResult.status === 'fulfilled') this.allCapacities.set(capsResult.value);
    this.enrollments.set(enrollmentsResult.status === 'fulfilled' ? enrollmentsResult.value : []);
  }

  private async load(params?: { page?: number; size?: number; sortBy?: BootcampSortKey; direction?: SortDirection }): Promise<void> {
    const page = params?.page ?? this.currentPage();
    const size = params?.size ?? this.size();
    const sortBy = params?.sortBy ?? this.sortKey();
    const direction = params?.direction ?? this.sortDir();

    this.loading.set(true);
    this.apiError.set(null);
    try {
      const result = await this.getBootcamps.execute({ page, size, sortBy, direction });
      this.bootcamps.set(result.content);
      this.currentPage.set(result.page);
      this.size.set(result.size);
      this.sortKey.set(sortBy);
      this.sortDir.set(direction);
      this.totalElements.set(result.totalElements);
      this.totalPages.set(result.totalPages);
    } catch {
      this.apiError.set('No se pudo conectar con el servicio de bootcamps.');
    } finally {
      this.loading.set(false);
    }
  }

  private fullCap(id: number) {
    return this.allCapacities().find((c) => c.id === id) ?? { technologies: [] as Ref[], description: '' };
  }

  private techsOf(caps: Ref[]) {
    return [...new Map(caps.flatMap((c) => this.fullCap(c.id).technologies).map((t) => [t.id, t])).values()];
  }

  // The API paginates and sorts server-side; the search box only narrows
  // the page that is already loaded (there is no server-side name filter).
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.bootcamps()
      .filter((b) => !q || b.name.toLowerCase().includes(q))
      .map((b) => ({
        ...b,
        description: b.description || 'Sin descripción',
        releaseDateText: fmt(b.releaseDate),
        durationText: `${b.durationDays} días`,
        enrolledCount: this.enrollments().filter((e) => e.bootcampId === b.id).length,
        chips: b.capacities.map((c) => `${c.name} · ${this.fullCap(c.id).technologies.length}`)
      }));
  });

  protected readonly pageInfo = computed(
    () => `Página ${this.currentPage() + 1} de ${this.totalPages()} · ${this.totalElements()} bootcamps`
  );

  protected readonly capPick = computed(() => {
    const pq = this.pickQ().trim().toLowerCase();
    return this.allCapacities()
      .filter((c) => !pq || c.name.toLowerCase().includes(pq))
      .map((c) => {
        const on = this.selectedCapIds().includes(c.id);
        return { id: c.id, name: c.name, sub: on ? '✓ Seleccionada' : `${c.technologies.length} tecnologías`, on };
      });
  });

  protected readonly pickCount = computed(() => `${this.selectedCapIds().length} seleccionadas · 1 a 4`);

  protected readonly delName = computed(() => this.allBootcamps().find((b) => b.id === this.delId())?.name ?? '');

  protected readonly viewing = computed(() => {
    const vb = this.allBootcamps().find((b) => b.id === this.viewId());
    if (!vb) return null;
    const techs = this.techsOf(vb.capacities);
    const people = this.enrollments().filter((e) => e.bootcampId === vb.id);
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

  setPage(delta: number): void {
    const next = this.currentPage() + delta;
    if (next >= 0 && next < this.totalPages()) this.load({ page: next });
  }

  setSort(key: BootcampSortKey): void {
    this.load({ page: 0, sortBy: key });
  }

  toggleDir(): void {
    this.load({ page: 0, direction: this.sortDir() === 'asc' ? 'desc' : 'asc' });
  }

  setSize(n: number): void {
    this.load({ page: 0, size: n });
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
    this.errors.set({ name: '', description: '', releaseDate: '', durationDays: '', ids: '' });
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
    if (id == null || this.deleting()) return;
    const name = this.delName();
    this.deleting.set(true);
    try {
      const result = await this.deleteBootcamp.execute(id);
      if (!result.ok) {
        this.toast.show(result.message);
        return;
      }
      await this.removeBootcampSchedule.execute(id);
      this.drawerOpen.set(false);
      this.viewId.set(null);
      this.toast.show(`Bootcamp "${name}" eliminado`);
      await Promise.all([this.load(), this.refreshLookups()]);
    } finally {
      this.delId.set(null);
      this.deleting.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.viewId() != null || this.saving()) return;
    this.submitted.set(true);
    this.saving.set(true);
    try {
      const result = await this.createBootcamp.execute({
        name: this.name(),
        description: this.description(),
        releaseDate: this.releaseDate(),
        durationDays: Number(this.durationDays()),
        capacitiesIds: this.selectedCapIds()
      });
      if (result.ok) {
        this.toast.show(`Bootcamp "${this.name().trim()}" creado`);
        this.drawerOpen.set(false);
        await Promise.all([this.load({ page: 0 }), this.refreshLookups()]);
        return;
      }
      if ('errors' in result) {
        this.errors.set(result.errors);
        return;
      }
      this.formError.set(result.apiError);
    } finally {
      this.saving.set(false);
    }
  }
}
