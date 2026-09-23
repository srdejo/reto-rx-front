import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GetTechnologiesUseCase } from '@core/application/use-cases/get-technologies.use-case';
import { GetCapacitiesUseCase } from '@core/application/use-cases/get-capacities.use-case';
import { GetBootcampsUseCase } from '@core/application/use-cases/get-bootcamps.use-case';
import { GetBootcampReportsUseCase } from '@core/application/use-cases/get-bootcamp-reports.use-case';
import { AuthService } from '@core/application/use-cases/auth.service';
import { Toast } from '@shared/components/toast/toast';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Toast],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css'
})
export class AdminShell {
  private readonly getTechnologies = inject(GetTechnologiesUseCase);
  private readonly getCapacities = inject(GetCapacitiesUseCase);
  private readonly getBootcamps = inject(GetBootcampsUseCase);
  private readonly getBootcampReports = inject(GetBootcampReportsUseCase);
  private readonly authService = inject(AuthService);

  protected readonly email = computed(() => this.authService.session()?.email ?? '');

  protected readonly nav = [
    { label: 'Dashboard', href: 'dashboard' },
    { label: 'Tecnologías', href: 'technologies' },
    { label: 'Capacidades', href: 'capacities' },
    { label: 'Bootcamps', href: 'bootcamps' }
  ];

  private readonly technologyCount = signal(0);
  private readonly capacityCount = signal(0);
  private readonly bootcampCount = signal(0);
  private readonly reportCount = signal(0);

  constructor() {
    this.getTechnologies.execute().then((t) => this.technologyCount.set(t.length));
    this.getCapacities.execute({ page: 0, size: 1, sortBy: 'name', direction: 'asc' }).then((p) => this.capacityCount.set(p.totalElements));
    this.getBootcamps.execute({ page: 0, size: 1, sortBy: 'name', direction: 'asc' }).then((p) => this.bootcampCount.set(p.totalElements));
    this.getBootcampReports.execute().then((r) => this.reportCount.set(r.length)).catch(() => undefined);
  }

  count(href: string): number {
    switch (href) {
      case 'dashboard':
        return this.reportCount();
      case 'technologies':
        return this.technologyCount();
      case 'capacities':
        return this.capacityCount();
      case 'bootcamps':
        return this.bootcampCount();
      default:
        return 0;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
