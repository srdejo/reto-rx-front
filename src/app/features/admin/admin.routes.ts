import { Routes } from '@angular/router';
import { AdminShell } from './admin-shell/admin-shell';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'technologies' },
      {
        path: 'technologies',
        loadComponent: () => import('./technologies-page/technologies-page').then((m) => m.TechnologiesPage)
      },
      {
        path: 'capacities',
        loadComponent: () => import('./capacities-page/capacities-page').then((m) => m.CapacitiesPage)
      },
      {
        path: 'bootcamps',
        loadComponent: () => import('./bootcamps-page/bootcamps-page').then((m) => m.BootcampsPage)
      }
    ]
  }
];
