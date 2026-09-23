import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetTechnologiesUseCase } from '@core/application/use-cases/get-technologies.use-case';
import { CreateTechnologyUseCase } from '@core/application/use-cases/create-technology.use-case';
import { GetAllCapacitiesUseCase } from '@core/application/use-cases/get-all-capacities.use-case';
import { Technology } from '@core/domain/models/technology.model';
import { ToastService } from '@shared/components/toast/toast.service';
import { Drawer } from '@shared/components/drawer/drawer';

@Component({
  selector: 'app-technologies-page',
  imports: [FormsModule, Drawer],
  templateUrl: './technologies-page.html',
  styleUrl: './technologies-page.css'
})
export class TechnologiesPage {
  private readonly getTechnologies = inject(GetTechnologiesUseCase);
  private readonly createTechnology = inject(CreateTechnologyUseCase);
  private readonly getAllCapacities = inject(GetAllCapacitiesUseCase);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly drawerOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');

  protected readonly technologies = signal<Technology[]>([]);
  protected readonly usageCounts = signal<Map<number, number>>(new Map());
  protected readonly loading = signal(false);
  protected readonly apiError = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  private async refresh(): Promise<void> {
    this.loading.set(true);
    this.apiError.set(null);
    try {
      const [technologies, capacities] = await Promise.all([this.getTechnologies.execute(), this.getAllCapacities.execute()]);
      this.technologies.set(technologies);
      const usage = new Map<number, number>();
      for (const c of capacities) {
        for (const t of c.technologies) usage.set(t.id, (usage.get(t.id) ?? 0) + 1);
      }
      this.usageCounts.set(usage);
    } catch {
      this.apiError.set('No se pudo conectar con el servicio de tecnologías.');
    } finally {
      this.loading.set(false);
    }
  }

  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    const usage = this.usageCounts();
    return this.technologies()
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .map((t) => {
        const n = usage.get(t.id) ?? 0;
        return { ...t, usageText: n === 1 ? '1 capacidad' : `${n} capacidades` };
      });
  });

  protected readonly errors = signal({ name: '', description: '' });

  openDrawer(): void {
    this.name.set('');
    this.description.set('');
    this.submitted.set(false);
    this.formError.set('');
    this.errors.set({ name: '', description: '' });
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.submitted.set(true);
    this.saving.set(true);
    try {
      const result = await this.createTechnology.execute({ name: this.name(), description: this.description() });
      if (result.ok) {
        this.toast.show(`Tecnología "${this.name().trim()}" creada`);
        this.drawerOpen.set(false);
        await this.refresh();
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
