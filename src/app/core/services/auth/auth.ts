import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterRequest } from '@core/interfaces/auth/register-request.interface';
import { environment } from '@env/environment';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthState } from '../../interfaces/auth/auth-state.interface';
import { LoginRequest } from '../../interfaces/auth/login-request.interface';
import { LoginResponse } from '../../interfaces/auth/login-response.interface';
import { User } from '../../interfaces/auth/user.interface';
import { HttpService } from '../http-service/http';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/auth`;
  
  private readonly http = inject(HttpService);
  private readonly router = inject(Router);

  private readonly _authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  private _authStateSignal = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  readonly authState$ = this._authState$.asObservable();
  readonly isAuthenticated$ = this._authState$.pipe(map(state => state.isAuthenticated));
  readonly currentUser$ = this._authState$.pipe(map(state => state.user));
  readonly authState = this._authStateSignal.asReadonly();
  readonly isAuthenticated = () => this._authStateSignal().isAuthenticated;
  readonly currentUser = () => this._authStateSignal().user;

  constructor() {
    this.initializeAuth();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.doPost<LoginRequest, LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.setAuthData(response.token, response.user)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.doPost<RegisterRequest, LoginResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => this.setAuthData(response.token, response.user)),
        catchError(error => {
          console.error('Register error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<void> {
    return of(null).pipe(
      tap(() => this.clearAuthData()),
      tap(() => this.router.navigate(['/auth/login'])),
      map(() => void 0),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return of(void 0);
      })
    );
  }

  forceLogout(reason?: string): void {
    if (!environment.production && reason) {
      console.warn(`Force logout triggered: ${reason}`);
    }
    
    this.clearAuthData();
    this.router.navigate(['/auth/login'], { 
      queryParams: reason ? { reason } : {} 
    });
  }

  isUserAuthenticated(): Observable<boolean> {
    return of(this.getStoredToken()).pipe(
      map(token => !!token),
      catchError(() => of(false))
    );
  }

  getToken(): string | null {
    return this._authState$.value.token || this.getStoredToken();
  }
  isTokenExpired(): Observable<boolean> {
    const token = this.getStoredToken();
    if (!token) return of(true);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convertir a millisegundos
      return of(Date.now() > expiry);
    } catch {
      return of(true);
    }
  }

  validateCurrentSession(): Observable<boolean> {
    return this.isTokenExpired().pipe(
      switchMap(isExpired => {
        if (isExpired) {
          this.clearAuthData();
          return of(false);
        }
        
        const user = this.getStoredUser();
        const token = this.getStoredToken();
        
        if (user && token) {
          if (!user.isActive) {
            this.clearAuthData();
            return of(false);
          }
          
          this.setAuthData(token, user);
          return of(true);
        }
        
        return of(false);
      }),
      catchError(() => {
        this.clearAuthData();
        return of(false);
      })
    );
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.isTokenExpired().subscribe(isExpired => {
        if (!isExpired && user.isActive) {
          this.setAuthData(token, user);
        } else {
          this.clearAuthData();
        }
      });
    }
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    const newState: AuthState = {
      isAuthenticated: true,
      user,
      token
    };

    this._authState$.next(newState);
    this._authStateSignal.set(newState);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    const newState: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null
    };

    this._authState$.next(newState);
    this._authStateSignal.set(newState);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}