import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleName } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as RoleName[];
  
  if (!authService.checkAuthentication()) {
    router.navigate(['/login']);
    return false;
  }
  
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      authService.hasRole(role)
    );
    
    if (!hasRequiredRole) {
      router.navigate(['/dashboard']);
      return false;
    }
  }
  
  return true;
};