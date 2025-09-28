import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Service/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Interceptor called for URL:', req.url);
  console.log('Token from storage:', token);

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Request headers after adding Authorization:', authReq.headers.get('Authorization'));
    return next(authReq);
  }

  console.log('No token found, sending request without Authorization header');
  return next(req);
};