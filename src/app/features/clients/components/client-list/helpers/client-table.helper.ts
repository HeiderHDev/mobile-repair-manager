import { TableColumn } from '@shared/interfaces/table/table-column.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';
import { Client } from '@clients/interfaces/cliente.interface';

export class ClientTableHelper {
  getTableColumns(): TableColumn<Client>[] {
    return [
      {
        field: 'firstName',
        header: 'Nombre',
        sortable: true,
        width: '150px'
      },
      {
        field: 'lastName',
        header: 'Apellidos',
        sortable: true,
        width: '150px'
      },
      {
        field: 'documentNumber',
        header: 'Documento',
        sortable: true,
        width: '120px'
      },
      {
        field: 'email',
        header: 'Correo Electrónico',
        sortable: true,
        width: '200px'
      },
      {
        field: 'phone',
        header: 'Teléfono',
        sortable: true,
        width: '150px'
      },
      {
        field: 'address',
        header: 'Dirección',
        sortable: false,
        width: '200px'
      },
      {
        field: 'isActive',
        header: 'Estado',
        type: 'boolean',
        width: '100px'
      },
      {
        field: 'createdAt',
        header: 'Fecha Registro',
        type: 'date',
        sortable: true,
        width: '150px'
      }
    ];
  }

  getTableActions(onAction?: (action: string, client: Client) => void): TableAction<Client>[] {
    return [
      {
        label: 'Ver Teléfonos',
        icon: 'pi pi-mobile',
        severity: 'primary',
        action: (client) => onAction?.('ver teléfonos', client)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        severity: 'info',
        action: (client) => onAction?.('editar', client)
      },
      {
        label: 'Toggle Estado',
        icon: 'pi pi-power-off',
        severity: 'info',
        action: (client) => onAction?.('toggle estado', client)
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (client) => onAction?.('eliminar', client),
        disabled: (client) => client.isActive
      }
    ];
  }
}