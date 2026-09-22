import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'user' },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routes').then((m) => m.USER_ROUTES)
  },
  { path: '**', redirectTo: 'user' }
];
