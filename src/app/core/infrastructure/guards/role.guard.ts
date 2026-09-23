import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/application/use-cases/auth.service';
import { Role } from '@core/domain/models/auth.model';

const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: '/admin',
  USER: '/user'
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data['role'] as Role | undefined;
  const currentRole = auth.getRole();

  if (requiredRole && currentRole !== requiredRole) {
    const redirectTo = currentRole ? HOME_BY_ROLE[currentRole] : '/login';
    return router.createUrlTree([redirectTo]);
  }

  return true;
};
