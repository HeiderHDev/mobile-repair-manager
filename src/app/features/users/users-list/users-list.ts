import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TableColumn } from '@shared/interfaces/table/table-column.interface';
import { User } from '../interfaces/user.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { UserRole } from '@core/enum/auth/user-role.enum';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { UserFormModal } from '../components/user-form-modal/user-form-modal';
import { DataTable } from '@shared/components/data-table/data-table';
import { UserData } from '../services/user-data';
import { Notification } from '@core/services/notification/notification';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    DataTable,
    UserFormModal,
    ToastModule
  ],
  templateUrl: './users-list.html',
  styles: ``
})
export class UsersList implements OnInit {
  private readonly userService = inject(UserData);
  private readonly notificationService = inject(Notification);

  users = signal<User[]>([]);
  showUserModal = signal(false);
  selectedUser = signal<User | null>(null);
  isLoading = signal(false);

  readonly tableConfig = computed<TableConfig<User>>(() => ({
    title: 'Gestión de Usuarios Administradores',
    columns: this.getTableColumns(),
    actions: this.getTableActions(),
    showAddButton: true,
    addButtonLabel: 'Nuevo Usuario',
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
    const { action, item } = event;

    switch (action.toLowerCase()) {
      case 'editar':
        this.openEditModal(item);
        break;
      case 'eliminar':
        this.deleteUser(item.id);
        break;
      case 'toggle estado':
        this.toggleUserStatus(item.id);
        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  }

  handleUserSaved(): void {
    this.loadUsers();
  }

  closeUserModal(): void {
    this.showUserModal.set(false);
    this.selectedUser.set(null);
  }

  private getTableColumns(): TableColumn<User>[] {
    return [
      {
        field: 'username',
        header: 'Usuario',
        sortable: true,
        width: '150px'
      },
      {
        field: 'fullName',
        header: 'Nombre Completo',
        sortable: true,
        width: '200px'
      },
      {
        field: 'email',
        header: 'Correo Electrónico',
        sortable: true,
        width: '250px'
      },
      {
        field: 'role',
        header: 'Rol',
        sortable: true,
        width: '120px'
      },
      {
        field: 'isActive',
        header: 'Estado',
        type: 'boolean',
        width: '100px'
      },
      {
        field: 'createdAt',
        header: 'Fecha Creación',
        type: 'date',
        sortable: true,
        width: '150px'
      },
      {
        field: 'lastLogin',
        header: 'Último Acceso',
        type: 'date',
        sortable: true,
        width: '150px'
      }
    ];
  }

  private getTableActions(): TableAction<User>[] {
    return [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        severity: 'info',
        action: (user) => this.openEditModal(user),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN
      },
      {
        label: 'Toggle Estado',
        icon: 'pi pi-power-off',
        severity: 'danger',
        action: (user) => this.toggleUserStatus(user.id),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (user) => this.deleteUser(user.id),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN,
        disabled: (user) => user.isActive
      }
    ];
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private openCreateModal(): void {
    this.selectedUser.set(null);
    this.showUserModal.set(true);
  }

  private openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.showUserModal.set(true);
  }

  private deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.notificationService.userDeleted('Usuario');
      },
      error: () => {
        this.loadUsers();
      }
    });
  }

  private toggleUserStatus(userId: string): void {
    this.userService.toggleUserStatus(userId).subscribe({
      next: (updatedUser) => {
        this.loadUsers();
        const status = updatedUser.isActive ? 'activado' : 'desactivado';
        this.notificationService.info(
          'Estado actualizado',
          `El usuario ha sido ${status}`
        );
      },
      error: () => {
        this.loadUsers();
      }
    });
  }
}
