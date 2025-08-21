import { signal } from '@angular/core';
import { User } from '@users/interfaces/user.interface';

export class UserStateManager {
  private readonly _users = signal<User[]>([]);
  private readonly _showUserModal = signal(false);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);

  readonly users = this._users.asReadonly();
  readonly showUserModal = this._showUserModal.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  setUsers(users: User[]): void {
    this._users.set(users);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  openCreateModal(): void {
    this._selectedUser.set(null);
    this._showUserModal.set(true);
  }

  openEditModal(user: User): void {
    this._selectedUser.set(user);
    this._showUserModal.set(true);
  }

  closeModal(): void {
    this._showUserModal.set(false);
    this._selectedUser.set(null);
  }
}