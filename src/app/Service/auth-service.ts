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

  constructor() {
    // Restore user session on app start
    this.restoreSession();
  }

  // simple getter
  get currentUser(): User | null { return this._user$.value; }

  private restoreSession() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this._user$.next(user);
      } catch (e) {
        console.error('Failed to restore session:', e);
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{token: string, user: User}>(`${this.baseUrl}/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this._user$.next(response.user);
        
        // Fetch fresh user data from database to get current balance
        if (response.user.userId) {
          this.refreshUserData(response.user.userId);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  private refreshUserData(userId: number) {
    this.http.get<User>(`https://localhost:7076/api/User/${userId}`).subscribe({
      next: (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        this._user$.next(userData);
      },
      error: (err) => {
        console.error('Error refreshing user data:', err);
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this._user$.next(user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user$.next(null);
  }

  isAuthenticated(): boolean {
    return !!this._user$.value;
  }

  isAdmin(): boolean {
    return this._user$.value?.role?.toLowerCase() === 'admin';
  }

  refreshCurrentUser() {
    const currentUser = this._user$.value;
    if (currentUser?.userId) {
      this.refreshUserData(currentUser.userId);
    }
  }
}
