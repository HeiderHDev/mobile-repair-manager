import { TableColumn } from '@shared/interfaces/table/table-column.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { UserRole } from '@core/enum/auth/user-role.enum';
import { User } from '@users/interfaces/user.interface';
import { UserTableActions } from '@users/interfaces/user-table-actions.interface';

export class UserTableHelper {
  getTableColumns(): TableColumn<User>[] {
    return [
      {
        field: 'username',
        header: 'Usuario',
        sortable: true,
        width: '150px'
      },
      {
        field: 'fullName',
        header: 'Nombre completo',
        sortable: true,
        width: '200px'
      },
      {
        field: 'email',
        header: 'Correo electrónico',
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
        header: 'Fecha de creación',
        type: 'date',
        sortable: true,
        width: '150px'
      },
      {
        field: 'lastLogin',
        header: 'Último acceso',
        type: 'date',
        sortable: true,
        width: '150px'
      }
    ];
  }

  getTableActions(actions: UserTableActions): TableAction<User>[] {
    return [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        severity: 'info',
        action: (user) => actions.onEdit(user),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN
      },
      {
        label: 'Toggle estado',
        icon: 'pi pi-power-off',
        severity: 'danger',
        action: (user) => actions.onToggleStatus(user),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (user) => actions.onDelete(user),
        visible: (user) => user.role !== UserRole.SUPER_ADMIN,
        disabled: (user) => user.isActive
      }
    ];
  }
}