import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TechnologyService } from '../../core/technology.service';
import { CapacityService } from '../../core/capacity.service';
import { BootcampService } from '../../core/bootcamp.service';
import { IterationEnrollmentStore } from '../../core/iteration-enrollment.store';
import { Toast } from '../../shared/ui/toast/toast';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Toast],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css'
})
export class AdminShell implements OnInit {
  protected readonly technologyService = inject(TechnologyService);
  protected readonly capacityService = inject(CapacityService);
  protected readonly bootcampService = inject(BootcampService);
  protected readonly iterationStore = inject(IterationEnrollmentStore);

  protected readonly nav = [
    { label: 'Tecnologías', href: 'technologies' },
    { label: 'Capacidades', href: 'capacities' },
    { label: 'Bootcamps', href: 'bootcamps' },
    { label: 'Iteraciones', href: 'iterations' }
  ];

  ngOnInit(): void {
    this.technologyService.load();
    this.capacityService.load();
    this.capacityService.loadAll();
    this.bootcampService.load();
    this.bootcampService.loadAll();
  }

  count(href: string): number {
    switch (href) {
      case 'technologies':
        return this.technologyService.technologies().length;
      case 'capacities':
        return this.capacityService.totalElements();
      case 'bootcamps':
        return this.bootcampService.totalElements();
      case 'iterations':
        return this.iterationStore.iterations().length;
      default:
        return 0;
    }
  }
}
