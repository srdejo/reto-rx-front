import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TechnologyService } from '../../core/technology.service';
import { CapacityService } from '../../core/capacity.service';
import { ToastService } from '../../core/toast.service';
import { Drawer } from '../../shared/ui/drawer/drawer';

@Component({
  selector: 'app-technologies-page',
  imports: [FormsModule, Drawer],
  templateUrl: './technologies-page.html',
  styleUrl: './technologies-page.css'
})
export class TechnologiesPage {
  private readonly technologyService = inject(TechnologyService);
  private readonly capacityService = inject(CapacityService);
  private readonly toast = inject(ToastService);

  protected readonly q = signal('');
  protected readonly drawerOpen = signal(false);
  protected readonly submitted = signal(false);
  protected readonly formError = signal('');
  protected readonly name = signal('');
  protected readonly description = signal('');

  protected readonly loading = this.technologyService.loading;
  protected readonly apiError = this.technologyService.error;

  constructor() {
    this.capacityService.loadAll();
  }

  private readonly usage = (id: number) =>
    this.capacityService.allCapacities().filter((c) => c.technologies.some((t) => t.id === id)).length;

  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.technologyService
      .technologies()
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .map((t) => {
        const n = this.usage(t.id);
        return { ...t, usageText: n === 1 ? '1 capacidad' : `${n} capacidades` };
      });
  });

  protected readonly errors = computed(() => {
    if (!this.submitted()) return { name: '', description: '' };
    const name = this.name().trim();
    const description = this.description().trim();
    const dup = this.technologyService.technologies().some((t) => t.name.toLowerCase() === name.toLowerCase());
    return {
      name: !name ? 'El nombre es obligatorio.' : name.length > 50 ? 'Máximo 50 caracteres.' : dup ? 'Ya existe una tecnología con ese nombre.' : '',
      description: !description ? 'La descripción es obligatoria.' : description.length > 90 ? 'Máximo 90 caracteres.' : ''
    };
  });

  openDrawer(): void {
    this.name.set('');
    this.description.set('');
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
    if (e.name || e.description) return;
    try {
      await this.technologyService.create({ name: this.name().trim(), description: this.description().trim() });
      this.toast.show(`Tecnología "${this.name().trim()}" creada`);
      this.drawerOpen.set(false);
    } catch {
      this.formError.set('No se pudo guardar en la API.');
    }
  }
}
