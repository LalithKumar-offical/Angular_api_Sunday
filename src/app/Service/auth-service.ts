// src/app/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { User } from '../Models/Interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user$ = new BehaviorSubject<User | null>(null);
  private baseUrl = 'https://localhost:7076/api/Token';
  user$ = this._user$.asObservable();

  // simple getter
  get currentUser(): User | null { return this._user$.value; }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{token: string, user: User}>(`${this.baseUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this._user$.next(response.user);
      }),
      catchError(error => {
        // Demo mode fallback when backend is not running
        if (error.status === 0) {
          console.warn('Backend not available, using demo mode');
          const demoUser: User = {
            userId: 1,
            userName: 'Demo Admin',
            email: credentials.email,
            role: credentials.email.includes('admin') ? 'Admin' : 'User',
            password: '',
            isVerfied: true,
            balance: 10000
          };
          localStorage.setItem('token', 'demo-token');
          this._user$.next(demoUser);
          return of({ token: 'demo-token', user: demoUser });
        }
        throw error;
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this._user$.next(null);
  }

  isAuthenticated(): boolean {
    return !!this._user$.value;
  }

  isAdmin(): boolean {
    return this._user$.value?.role?.toLowerCase() === 'admin';
  }
  // AuthService
public setCurrentUser(user: User) {
  this._user$.next(user);
}

}
