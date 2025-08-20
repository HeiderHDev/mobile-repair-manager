import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Auth } from '@core/services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.validateCurrentSession().pipe(
    map(isValid => {
      if (!isValid) {
        console.warn('Usuario no autenticado, redirigiendo al login');
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return false;
      }

      const currentUser = authService.currentUser();
      if (currentUser && !currentUser.isActive) {
        console.warn('Usuario inactivo, redirigiendo al login');
        authService.logout().subscribe();
        router.navigate(['/auth/login']);
        return false;
      }

      return true;
    }),
    catchError(error => {
      console.error('Error en auth guard:', error);
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};

export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  return authService.isUserAuthenticated().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['/clients']);
        return false;
      }
      return true;
    }),
    catchError(error => {
      console.error('Error en noAuth guard:', error);
      return of(true);
    })
  );
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(Auth);
    const router = inject(Router);

    return authService.validateCurrentSession().pipe(
      map(isValid => {
        if (!isValid) {
          router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        const currentUser = authService.currentUser();
        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
          console.warn('Usuario sin permisos suficientes');
          router.navigate(['/clients']);
          return false;
        }

        return true;
      }),
      catchError(error => {
        console.error('Error en role guard:', error);
        router.navigate(['/auth/login']);
        return of(false);
      })
    );
  };
};