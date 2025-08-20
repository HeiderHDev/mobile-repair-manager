import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@core/services/auth/auth';
import { catchError, switchMap, throwError } from 'rxjs';
import { Notification } from '@core/services/notification/notification';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const notificationService = inject(Notification);
  
  const publicUrls = ['/auth/login', '/auth/register'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  if (isPublicUrl) {
    return next(req);
  }

  return authService.isTokenExpired().pipe(
    switchMap(isExpired => {
      if (isExpired) {
        authService.logout().subscribe();
        router.navigate(['/auth/login']);
        return throwError(() => new Error('Token expired'));
      }

      const token = authService.getToken();
      let authReq = req;

      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.warn('Token inválido o expirado, cerrando sesión');
            
            if (!req.url.includes('/auth/login')) {
              notificationService.sessionExpired();
            }
            
            authService.logout().subscribe();
            router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            console.warn('Acceso denegado');
            notificationService.permissionError();
          }
          
          return throwError(() => error);
        })
      );
    })
  );
};