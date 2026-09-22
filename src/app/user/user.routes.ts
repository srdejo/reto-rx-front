import { Routes } from '@angular/router';
import { UserShell } from './user-shell/user-shell';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserShell,
    children: [
      { path: '', loadComponent: () => import('./home-page/home-page').then((m) => m.HomePage) },
      {
        path: 'bootcamp/:id',
        loadComponent: () => import('./bootcamp-detail-page/bootcamp-detail-page').then((m) => m.BootcampDetailPage)
      },
      {
        path: 'invite/:token',
        loadComponent: () => import('./invite-page/invite-page').then((m) => m.InvitePage)
      }
    ]
  }
];
