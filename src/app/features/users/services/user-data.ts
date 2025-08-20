import { inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap, throwError, catchError } from 'rxjs';
import { UserRole } from '@core/enum/auth/user-role.enum';
import { CreateUserRequest } from '../interfaces/create-user-request.interface';
import { UpdateUserRequest } from '../interfaces/update-user-request.interface';
import { Notification } from '@core/services/notification/notification';
import { Auth } from '@core/services/auth/auth';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UserData {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly notificationService = inject(Notification);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/users`;
  
  private usersState = signal<User[]>([]);
  readonly users = this.usersState.asReadonly();

  constructor() {
    this.loadUsers();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(users => {
        this.usersState.set([...users]);
        return users;
      }),
      catchError(error => {
        console.error('Error loading users:', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: string): Observable<User | null> {
    return this.http.get<User>(`${this.API_URL}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => ({
            status: 404,
            error: { message: 'Usuario no encontrado' }
          }));
        }
        return throwError(() => error);
      })
    );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, userData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(newUser => {
        const currentUsers = this.usersState();
        this.usersState.set([...currentUsers, newUser]);
        this.notificationService.success('Éxito', 'Usuario creado correctamente');
      }),
      catchError(error => {
        console.error('Error creating user:', error);
        
        // Manejar errores específicos del backend
        if (error.status === 400) {
          const errorMessage = error.error?.error || 'Datos inválidos';
          this.notificationService.error('Error', errorMessage);
        } else if (error.status === 403) {
          this.notificationService.error('Error', 'No tienes permisos para crear usuarios');
        } else {
          this.notificationService.error('Error', 'No se pudo crear el usuario');
        }
        
        return throwError(() => error);
      })
    );
  }

  updateUser(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${userData.id}`, userData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersState();
        const updatedUsers = currentUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        this.usersState.set(updatedUsers);
        this.notificationService.success('Éxito', 'Usuario actualizado correctamente');
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        
        if (error.status === 400) {
          const errorMessage = error.error?.error || 'Datos inválidos';
          this.notificationService.error('Error', errorMessage);
        } else if (error.status === 403) {
          this.notificationService.error('Error', 'No tienes permisos para actualizar este usuario');
        } else if (error.status === 404) {
          this.notificationService.error('Error', 'Usuario no encontrado');
        } else {
          this.notificationService.error('Error', 'No se pudo actualizar el usuario');
        }
        
        return throwError(() => error);
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(() => {
        const currentUsers = this.usersState();
        const filteredUsers = currentUsers.filter(user => user.id !== id);
        this.usersState.set(filteredUsers);
        this.notificationService.success('Éxito', 'Usuario eliminado correctamente');
      }),
      map(() => true),
      catchError(error => {
        console.error('Error deleting user:', error);
        
        if (error.status === 400) {
          const errorMessage = error.error?.error || 'No se puede eliminar un usuario activo';
          this.notificationService.error('Error', errorMessage);
        } else if (error.status === 403) {
          this.notificationService.error('Error', 'No tienes permisos para eliminar usuarios');
        } else if (error.status === 404) {
          this.notificationService.error('Error', 'Usuario no encontrado');
        } else {
          this.notificationService.error('Error', 'No se pudo eliminar el usuario');
        }
        
        return throwError(() => error);
      })
    );
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/toggle-status`, {}, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(updatedUser => {
        const currentUsers = this.usersState();
        const updatedUsers = currentUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        this.usersState.set(updatedUsers);
        
        const statusText = updatedUser.isActive ? 'activado' : 'desactivado';
        this.notificationService.success('Éxito', `Usuario ${statusText} correctamente`);
      }),
      catchError(error => {
        console.error('Error toggling user status:', error);
        
        if (error.status === 403) {
          const errorMessage = error.error?.error || 'No tienes permisos para cambiar el estado del usuario';
          this.notificationService.error('Error', errorMessage);
        } else if (error.status === 404) {
          this.notificationService.error('Error', 'Usuario no encontrado');
        } else {
          this.notificationService.error('Error', 'No se pudo cambiar el estado del usuario');
        }
        
        return throwError(() => error);
      })
    );
  }

  private loadUsers(): void {
    // Solo cargar usuarios si está autenticado
    if (this.authService.isAuthenticated()) {
      this.getUsers().subscribe({
        error: (error) => {
          console.error('Error loading initial users:', error);
        }
      });
    }
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Administrador',
    };
    return roleLabels[role] || role;
  }

  getRoleOptions(): { value: UserRole; label: string }[] {
    const currentUser = this.authService.currentUser();
    
    // Solo Super Admin puede asignar roles
    if (currentUser?.role === UserRole.SUPER_ADMIN) {
      return [
        { value: UserRole.ADMIN, label: 'Administrador' },
      ];
    }
    
    return [];
  }
}