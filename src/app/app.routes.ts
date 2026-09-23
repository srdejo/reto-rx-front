import { Routes } from '@angular/router';
import { authGuard } from '@core/infrastructure/guards/auth.guard';
import { roleGuard } from '@core/infrastructure/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@features/auth/register-page/register-page').then((m) => m.RegisterPage)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () => import('@features/users/user.routes').then((m) => m.USER_ROUTES)
  },
  { path: '**', redirectTo: 'login' }
];
