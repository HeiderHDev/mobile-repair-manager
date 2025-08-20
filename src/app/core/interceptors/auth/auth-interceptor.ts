import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@core/services/auth/auth';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }
  return from(authService.getStoredToken()).pipe(
    switchMap(token => {
      if (token) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        
        return next(authReq).pipe(
          catchError((error) => {
            if (error.status === 401) {
              console.warn('Token inválido o expirado, cerrando sesión');
              authService.logout().catch(err => 
                console.error('Error durante logout automático:', err)
              );
              router.navigate(['/auth/login']);
            }
            
            return throwError(() => error);
          })
        );
      }
      return next(req);
    })
  );
};