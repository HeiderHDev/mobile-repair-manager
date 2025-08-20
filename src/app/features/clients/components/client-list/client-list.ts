import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable, PaginatedResponse } from '@shared/components/data-table/data-table';
import { ClientFormModal } from '../client-form-modal/client-form-modal';
import { ClientData } from '@clients/services/client-data';
import { Notification } from '@core/services/notification/notification';
import { Router } from '@angular/router';
import { Client } from '@clients/interfaces/cliente.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { TableColumn } from '@shared/interfaces/table/table-column.interface';
import { TableAction } from '@shared/interfaces/table/table-action.interface';

@Component({
  selector: 'app-client-list',
  imports: [
    CommonModule,
    DataTable,
    ClientFormModal
  ],
  templateUrl: './client-list.html',
  styles: `
    .clients-management {
      padding: 1rem;
    } 
  `
})
export class ClientList implements OnInit {
  private readonly clientService = inject(ClientData);
  private readonly notificationService = inject(Notification);
  private readonly router = inject(Router);

  private readonly _paginatedData = signal<PaginatedResponse<Client> | null>(null);
  readonly paginatedData = computed<PaginatedResponse<Client> | Client[]>(() => 
    this._paginatedData() || []
  );
  showClientModal = signal(false);
  selectedClient = signal<Client | null>(null);
  isLoading = signal(false);
  
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');

  readonly tableConfig = computed<TableConfig<Client>>(() => ({
    title: 'Gestión de Clientes',
    columns: this.getTableColumns(),
    actions: this.getTableActions(),
    showAddButton: true,
    addButtonLabel: 'Nuevo Cliente',
    onAdd: () => this.openCreateModal(),
    showSearch: true,
    searchPlaceholder: 'Buscar clientes...',
    emptyMessage: 'No hay clientes registrados',
    paginator: true,
    rows: this.pageSize(),
    rowsPerPageOptions: [5, 10, 20, 50]
  }));

  ngOnInit(): void {
    this.loadClientsPaginated();
  }

  handleTableAction(event: { action: string; item: Client }): void {
    const { action, item } = event;

    switch (action.toLowerCase()) {
      case 'editar':
        this.openEditModal(item);
        break;
      case 'eliminar':
        this.deleteClient(item.id);
        break;
      case 'ver teléfonos':
        this.navigateToClientPhones(item.id);
        break;
      case 'toggle estado':
        this.toggleClientStatus(item.id);
        break;
      default:
        break;
    }
  }

  handlePageChanged(event: { page: number; limit: number }): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.limit);
    this.loadClientsPaginated();
  }

  handleSearchChanged(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.loadClientsPaginated();
  }

  handleClientSaved(): void {
    this.loadClientsPaginated();
  }

  closeClientModal(): void {
    this.showClientModal.set(false);
    this.selectedClient.set(null);
  }

  private getTableColumns(): TableColumn<Client>[] {
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

  private getTableActions(): TableAction<Client>[] {
    return [
      {
        label: 'Ver Teléfonos',
        icon: 'pi pi-mobile',
        severity: 'primary',
        action: (client) => this.navigateToClientPhones(client.id)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        severity: 'info',
        action: (client) => this.openEditModal(client)
      },
      {
        label: 'Toggle Estado',
        icon: 'pi pi-power-off',
        severity: 'info',
        action: (client) => this.toggleClientStatus(client.id)
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        severity: 'danger',
        action: (client) => this.deleteClient(client.id),
        disabled: (client) => client.isActive
      }
    ];
  }

  private loadClientsPaginated(): void {
    this.isLoading.set(true);
    
    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined
    };
    
    this.clientService.getClientsPaginated(params).subscribe({
      next: (response) => {
        this._paginatedData.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.error(
          'Error al cargar clientes',
          error?.error?.message || 'Error desconocido'
        );
        this.isLoading.set(false);
      }
    });
  }

  private openCreateModal(): void {
    this.selectedClient.set(null);
    this.showClientModal.set(true);
  }

  private openEditModal(client: Client): void {
    this.selectedClient.set(client);
    this.showClientModal.set(true);
  }

  private deleteClient(clientId: string): void {
    this.clientService.deleteClient(clientId).subscribe({
      next: () => {
        this.notificationService.success(
          'Cliente eliminado',
          'El cliente ha sido eliminado exitosamente'
        );
        this.loadClientsPaginated();
      },
      error: (error) => {
        this.notificationService.error(
          'Error al eliminar cliente',
          error?.error?.message || 'Error desconocido'
        );
      }
    });
  }

  private toggleClientStatus(clientId: string): void {
    this.clientService.toggleClientStatus(clientId).subscribe({
      next: (updatedClient) => {
        const status = updatedClient.isActive ? 'activado' : 'desactivado';
        this.notificationService.info(
          'Estado actualizado',
          `El cliente ha sido ${status}`
        );
        this.loadClientsPaginated();
      },
      error: (error) => {
        console.error('❌ Error al actualizar estado:', error);
        this.notificationService.error(
          'Error al actualizar estado',
          error?.error?.message || 'Error desconocido'
        );
      }
    });
  }

  private navigateToClientPhones(clientId: string): void {
    this.router.navigate(['/clients', clientId, 'phones']);
  }
}