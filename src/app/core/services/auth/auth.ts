import { inject, Injectable, signal } from '@angular/core';
import { AuthState } from '../../interfaces/auth/auth-state.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/auth/login-request.interface';
import { LoginResponse } from '../../interfaces/auth/login-response.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../../interfaces/auth/user.interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  
  private _authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  readonly authState = this._authState.asReadonly();
  readonly isAuthenticated = () => this._authState().isAuthenticated;
  readonly currentUser = () => this._authState().user;

  constructor() {
    this.initializeAuth();
  }
  
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role: string;
  }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this._authState.set({
          isAuthenticated: true,
          user,
          token
        });
      } catch (error) {
        console.error('Error al inicializar la autenticación:', error);
        this.clearAuthData();
      }
    }
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this._authState.set({
      isAuthenticated: true,
      user,
      token
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this._authState.set({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  getToken(): string | null {
    return this._authState().token;
  }
}