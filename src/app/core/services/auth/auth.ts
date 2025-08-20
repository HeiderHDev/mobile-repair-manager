import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';
import { AuthState } from '../../interfaces/auth/auth-state.interface';
import { LoginRequest } from '../../interfaces/auth/login-request.interface';
import { LoginResponse } from '../../interfaces/auth/login-response.interface';
import { User } from '../../interfaces/auth/user.interface';
import { HttpService } from '../htt-service/http';
import { StorageService } from '../storage-service/storage';

interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/auth`;
  
  private readonly http = inject(HttpService);
  private readonly storage: StorageService = inject(StorageService);
  private readonly router = inject(Router);

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

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.doPost<LoginRequest, LoginResponse>(`${this.API_URL}/login`, credentials)
      );

      await this.setAuthData(response.token, response.user);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.doPost<RegisterRequest, LoginResponse>(`${this.API_URL}/register`, userData)
      );

      await this.setAuthData(response.token, response.user);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.clearAuthData();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así navegar al login
      this.router.navigate(['/auth/login']);
    }
  }

  async isUserAuthenticated(): Promise<boolean> {
    try {
      const token = await firstValueFrom(this.storage.getItem<string>(this.TOKEN_KEY));
      return !!token;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this._authState().token;
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await firstValueFrom(this.storage.getItem<string>(this.TOKEN_KEY));
    } catch {
      return null;
    }
  }

  private async initializeAuth(): Promise<void> {
    try {
      const [token, userStr] = await Promise.all([
        firstValueFrom(this.storage.getItem<string>(this.TOKEN_KEY)),
        firstValueFrom(this.storage.getItem<string>(this.USER_KEY))
      ]);

      if (token && userStr) {
        const user: User = JSON.parse(userStr);
        this._authState.set({
          isAuthenticated: true,
          user,
          token
        });
      }
    } catch (error) {
      console.error('Error al inicializar la autenticación:', error);
      await this.clearAuthData();
    }
  }

  private async setAuthData(token: string, user: User): Promise<void> {
    try {
      await Promise.all([
        firstValueFrom(this.storage.setItem(this.TOKEN_KEY, token)),
        firstValueFrom(this.storage.setItem(this.USER_KEY, JSON.stringify(user)))
      ]);

      this._authState.set({
        isAuthenticated: true,
        user,
        token
      });
    } catch (error) {
      console.error('Error al guardar datos de autenticación:', error);
      throw error;
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        firstValueFrom(this.storage.deleteItem(this.TOKEN_KEY)),
        firstValueFrom(this.storage.deleteItem(this.USER_KEY))
      ]);

      this._authState.set({
        isAuthenticated: false,
        user: null,
        token: null
      });
    } catch {
      console.error('Error al limpiar datos de autenticación');
      this._authState.set({
        isAuthenticated: false,
        user: null,
        token: null
      });
    }
  }
}