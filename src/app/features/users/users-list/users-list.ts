import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { DataTable } from '@shared/components/data-table/data-table';
import { UserFormModal } from '../components/user-form-modal/user-form-modal';
import { UserData } from '../services/user-data';
import { User } from '../interfaces/user.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { UserStateManager } from './helpers/user-state.manager';
import { UserTableHelper } from './helpers/user-table.helper';
import { UserActionHandler } from './helpers/user-action.handler';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    DataTable,
    UserFormModal,
    ToastModule
  ],
  templateUrl: './users-list.html',
  styles: []
})
export class UsersList implements OnInit {
  private readonly userService = inject(UserData);
  private readonly stateManager = new UserStateManager();
  private readonly tableHelper = new UserTableHelper();
  private readonly actionHandler = new UserActionHandler(
    this.userService
  );

  readonly users = this.stateManager.users;
  readonly showUserModal = this.stateManager.showUserModal;
  readonly selectedUser = this.stateManager.selectedUser;
  readonly isLoading = this.stateManager.isLoading;

  readonly tableConfig = computed<TableConfig<User>>(() => ({
    title: 'Gestión de usuarios administradores',
    columns: this.tableHelper.getTableColumns(),
    actions: this.tableHelper.getTableActions({
      onEdit: (user) => this.openEditModal(user),
      onToggleStatus: (user) => this.toggleUserStatus(user),
      onDelete: (user) => this.deleteUser(user)
    }),
    showAddButton: true,
    addButtonLabel: 'Nuevo usuario',
    onAdd: () => this.openCreateModal(),
    showSearch: true,
    searchPlaceholder: 'Buscar usuarios...',
    emptyMessage: 'No hay usuarios registrados',
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 20, 50]
  }));

  ngOnInit(): void {
    this.loadUsers();
  }

  handleTableAction(event: { action: string; item: User }): void {
    this.actionHandler.execute(event.action, event.item, {
      onEdit: (user) => this.openEditModal(user),
      onRefreshData: () => this.loadUsers()
    });
  }

  handleUserSaved(): void {
    this.loadUsers();
  }

  closeUserModal(): void {
    this.stateManager.closeModal();
  }

  private loadUsers(): void {
    this.stateManager.setLoading(true);
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.stateManager.setUsers(users);
        this.stateManager.setLoading(false);
      },
      error: () => {
        this.stateManager.setLoading(false);
      }
    });
  }

  private openCreateModal(): void {
    this.stateManager.openCreateModal();
  }

  private openEditModal(user: User): void {
    this.stateManager.openEditModal(user);
  }

  private toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.loadUsers();
      }
    });
  }

  private deleteUser(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.loadUsers();
      }
    });
  }
}