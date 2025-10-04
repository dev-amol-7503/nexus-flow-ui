import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleName } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const requiredRoles = route.data['roles'] as RoleName[];
  
  if (!requiredRoles) {
    return true;
  }
  
  return authService.hasAnyRole(requiredRoles);
};