import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { finalize, Observable, delay } from 'rxjs';
import { Loading } from '../services/loading';
import { inject } from '@angular/core';

export const loadingInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const _loadingService = inject(Loading);
  _loadingService.show();

  return next(request).pipe(
    finalize(() => _loadingService.hide())
  );
};
