import { inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { UserRole } from '@core/enum/auth/user-role.enum';
import { CreateUserRequest } from '../interfaces/create-user-request.interface';
import { UpdateUserRequest } from '../interfaces/update-user-request.interface';
import { Notification } from '@core/services/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class UserData {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(Notification);
  
  private usersState = signal<User[]>([]);
  readonly users = this.usersState.asReadonly();

  private mockUsers: User[] = [
    {
      id: '1',
      username: 'superadmin',
      email: 'superadmin@repairshop.com',
      fullName: 'Super Administrador',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2025-01-19')
    },
    {
      id: '2',
      username: 'admin1',
      email: 'admin1@repairshop.com',
      fullName: 'Juan Pérez',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-02-20'),
      lastLogin: new Date('2025-01-18')
    },
    {
      id: '3',
      username: 'operator1',
      email: 'operator1@repairshop.com',
      fullName: 'María García',
      role: UserRole.ADMIN,
      isActive: false,
      createdAt: new Date('2024-03-10'),
      lastLogin: new Date('2025-01-15')
    },
    {
      id: '4',
      username: 'admin2',
      email: 'admin2@repairshop.com',
      fullName: 'Carlos Rodriguez',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date('2024-04-05'),
      lastLogin: new Date('2025-01-17')
    }
  ];

  constructor() {
    this.loadUsers();
  }

  getUsers(): Observable<User[]> {
    // Simulate API call
    return of(this.mockUsers).pipe(
      delay(500),
      map(users => {
        this.usersState.set([...users]);
        return users;
      })
    );
  }

  getUserById(id: string): Observable<User | null> {
    const user = this.mockUsers.find(u => u.id === id);
    return of(user || null).pipe(delay(300));
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    if (this.mockUsers.some(u => u.username === userData.username)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'El nombre de usuario ya existe' }
      }));
    }

    if (this.mockUsers.some(u => u.email === userData.email)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'El correo electrónico ya está registrado' }
      }));
    }

    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      ...userData,
      isActive: true,
      createdAt: new Date(),
      lastLogin: undefined
    };

    this.mockUsers.push(newUser);
    this.usersState.set([...this.mockUsers]);

    return of(newUser).pipe(delay(500));
  }

  updateUser(userData: UpdateUserRequest): Observable<User> {
    const userIndex = this.mockUsers.findIndex(u => u.id === userData.id);
    
    if (userIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Usuario no encontrado' }
      }));
    }

    if (userData.username && this.mockUsers.some(u => u.username === userData.username && u.id !== userData.id)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'El nombre de usuario ya existe' }
      }));
    }

    if (userData.email && this.mockUsers.some(u => u.email === userData.email && u.id !== userData.id)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'El correo electrónico ya está registrado' }
      }));
    }

    const updatedUser = {
      ...this.mockUsers[userIndex],
      ...userData
    };

    this.mockUsers[userIndex] = updatedUser;
    this.usersState.set([...this.mockUsers]);

    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: string): Observable<boolean> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Usuario no encontrado' }
      }));
    }

    const user = this.mockUsers[userIndex];
    
    if (user.isActive) {
      return throwError(() => ({
        status: 400,
        error: { message: 'No se puede eliminar un usuario activo. Desactívalo primero.' }
      }));
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return throwError(() => ({
        status: 403,
        error: { message: 'No se puede eliminar un Super Administrador' }
      }));
    }

    this.mockUsers.splice(userIndex, 1);
    this.usersState.set([...this.mockUsers]);

    return of(true).pipe(delay(500));
  }

  toggleUserStatus(id: string): Observable<User> {
    const userIndex = this.mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Usuario no encontrado' }
      }));
    }

    const user = this.mockUsers[userIndex];

    if (user.role === UserRole.SUPER_ADMIN) {
      return throwError(() => ({
        status: 403,
        error: { message: 'No se puede cambiar el estado de un Super Administrador' }
      }));
    }

    this.mockUsers[userIndex].isActive = !this.mockUsers[userIndex].isActive;
    this.usersState.set([...this.mockUsers]);

    return of(this.mockUsers[userIndex]).pipe(delay(300));
  }

  private loadUsers(): void {
    this.getUsers().subscribe();
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Administrador',
    };
    return roleLabels[role] || role;
  }

  getRoleOptions(): { value: UserRole; label: string }[] {
    return [
      { value: UserRole.ADMIN, label: 'Administrador' },
    ];
  }
}
