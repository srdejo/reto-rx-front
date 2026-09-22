import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'user' },
  {
    path: 'admin',
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('@features/users/user.routes').then((m) => m.USER_ROUTES)
  },
  { path: '**', redirectTo: 'user' }
];
