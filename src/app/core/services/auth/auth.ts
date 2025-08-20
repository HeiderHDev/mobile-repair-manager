import { inject, Injectable, signal } from '@angular/core';
import { AuthState } from '../../interfaces/auth/auth-state.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/auth/login-request.interface';
import { LoginResponse } from '../../interfaces/auth/login-response.interface';
import { catchError, Observable, of, tap } from 'rxjs';
import { UserRole } from '../../enum/auth/user-role.enum';
import { User } from '../../interfaces/auth/user.interface';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  
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
    return this.simulateLogin(credentials).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  private simulateLogin(credentials: LoginRequest): Observable<LoginResponse> {
    const validCredentials = {
      username: 'admin',
      password: 'admin123'
    };

    if (credentials.username === validCredentials.username && 
        credentials.password === validCredentials.password) {
      
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          username: credentials.username,
          email: 'admin@repairshop.com',
          fullName: 'Administrador',
          role: 'admin' as UserRole,
          isActive: true
        },
        expiresIn: 86400
      };

      return of(mockResponse);
    } else {
      throw new Error('Credenciales inválidas');
    }
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
