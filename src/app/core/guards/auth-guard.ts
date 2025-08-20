import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@core/services/auth/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const isAuthenticated = await authService.isUserAuthenticated();
    
    if (!isAuthenticated) {
      console.warn('Usuario no autenticado, redirigiendo al login');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    // Verificar si el usuario está activo
    const currentUser = authService.currentUser();
    if (currentUser && !currentUser.isActive) {
      console.warn('Usuario inactivo, redirigiendo al login');
      await authService.logout();
      router.navigate(['/auth/login']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en auth guard:', error);
    router.navigate(['/auth/login']);
    return false;
  }
};