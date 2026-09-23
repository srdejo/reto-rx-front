import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetBootcampReportsUseCase } from '@core/application/use-cases/get-bootcamp-reports.use-case';
import { BootcampReport } from '@core/domain/models/report.model';
import { Drawer } from '@shared/components/drawer/drawer';
import { ToastService } from '@shared/components/toast/toast.service';
import { addDays, fmt } from '@shared/utils/format.util';
import { ReportDetail } from './report-detail/report-detail';

const RANKING_SIZE = 5;
const CLOCK_TICK_MS = 30_000;

@Component({
  selector: 'app-dashboard-page',
  imports: [FormsModule, Drawer, ReportDetail],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
  private readonly getBootcampReports = inject(GetBootcampReportsUseCase);
  private readonly toast = inject(ToastService);

  protected readonly reports = signal<BootcampReport[]>([]);
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly q = signal('');
  protected readonly viewId = signal<number | null>(null);
  private readonly updatedAt = signal<number | null>(null);
  private readonly now = signal(Date.now());

  constructor() {
    this.load();
    const clock = setInterval(() => this.now.set(Date.now()), CLOCK_TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(clock));
  }

  async load(): Promise<boolean> {
    this.loading.set(true);
    this.apiError.set(null);
    try {
      this.reports.set(await this.getBootcampReports.execute());
      this.updatedAt.set(Date.now());
      this.now.set(Date.now());
      return true;
    } catch {
      this.apiError.set('No se pudo conectar con el servicio de reportes.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    if (await this.load()) this.toast.show('Datos actualizados');
  }

  protected readonly updatedText = computed(() => {
    const at = this.updatedAt();
    if (at == null) return '';
    const mins = Math.round((this.now() - at) / 60_000);
    return mins < 1 ? 'Actualizado hace un momento' : `Actualizado hace ${mins} min`;
  });

  protected readonly kpis = computed(() => {
    const reports = this.reports();
    const techIds = new Set(reports.flatMap((r) => r.capacities.flatMap((c) => c.technologies.map((t) => t.id))));
    const capIds = new Set(reports.flatMap((r) => r.capacities.map((c) => c.id)));
    const people = new Set(reports.flatMap((r) => r.enrolledPersons.map((p) => p.email)));
    return [
      { label: 'Bootcamps con inscritos', value: reports.filter((r) => r.enrolledCount > 0).length },
      { label: 'Inscripciones', value: reports.reduce((acc, r) => acc + r.enrolledCount, 0) },
      { label: 'Personas únicas', value: people.size },
      { label: 'Capacidades', value: capIds.size },
      { label: 'Tecnologías', value: techIds.size }
    ];
  });

  protected readonly ranking = computed(() => {
    const top = [...this.reports()].sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, RANKING_SIZE);
    const max = Math.max(1, ...top.map((r) => r.enrolledCount));
    return top.map((r, i) => ({
      pos: i + 1,
      id: r.bootcampId,
      name: r.name,
      value: r.enrolledCount,
      pct: Math.round((r.enrolledCount / max) * 100)
    }));
  });

  // Matches the bootcamp name or the name/email of any enrolled person.
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.reports()
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.enrolledPersons.some((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      )
      .map((r) => ({
        id: r.bootcampId,
        name: r.name,
        description: r.description || 'Sin descripción',
        range: `${fmt(r.releaseDate)} → ${fmt(addDays(r.releaseDate, r.durationDays))}`,
        durationText: `${r.durationDays} días`,
        enrolledCount: r.enrolledCount,
        chips: r.capacities.map((c) => `${c.name} · ${c.technologies.length} tec.`)
      }));
  });

  protected readonly countText = computed(() => {
    const n = this.rows().length;
    return `${n} ${n === 1 ? 'bootcamp' : 'bootcamps'}`;
  });

  protected readonly viewed = computed(() => this.reports().find((r) => r.bootcampId === this.viewId()) ?? null);

  openView(id: number): void {
    this.viewId.set(id);
  }

  closeView(): void {
    this.viewId.set(null);
  }
}
