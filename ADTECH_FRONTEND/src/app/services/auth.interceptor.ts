import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Bloqueia a barra de navegação (Entrar direto pela URL sem ter login ativo)
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // End points
  const excludedPaths = ['/api/v1/auth/login', '/api/v1/auth/login-form', '/api/v1/auth/refresh'];

  // Se não seguir as regras o sistema "trava"
  const isExcluded = excludedPaths.some((p) => req.url.includes(p));

  let handledReq = req;
  if (!isExcluded) {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      handledReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ${token}'),
      });
    }
  }

  return next(handledReq).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Clear tokens and redirect to login (generic handling)
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        try {
          router.navigate(['/login']);
        } catch {
          // ignore navigation failures to avoid throwing inside interceptor
        }
      }
      return throwError(() => err);
    })
  );
};
