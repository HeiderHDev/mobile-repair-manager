import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataTable } from '@shared/components/data-table/data-table';
import { ClientFormModal } from '../client-form-modal/client-form-modal';
import { ClientData } from '@clients/services/client-data';
import { Client } from '@clients/interfaces/cliente.interface';
import { TableConfig } from '@shared/interfaces/table/table-config.interface';
import { ClientStateManager } from './helpers/client-state.manager';
import { ClientTableHelper } from './helpers/client-table.helper';
import { ClientActionHandler } from './helpers/client-action.handler';

@Component({
  selector: 'app-client-list',
  imports: [
    CommonModule,
    DataTable,
    ClientFormModal
  ],
  templateUrl: './client-list.html',
  styles: [`
    .clients-management {
      padding: 1rem;
    }
  `]
})
export class ClientList implements OnInit {
  private readonly clientService = inject(ClientData);
  private readonly router = inject(Router);

  private readonly stateManager = new ClientStateManager();
  private readonly tableHelper = new ClientTableHelper();
  private readonly actionHandler = new ClientActionHandler(
    this.clientService,
    this.router
  );

  readonly paginatedData = this.stateManager.paginatedData;
  readonly showClientModal = this.stateManager.showClientModal;
  readonly selectedClient = this.stateManager.selectedClient;
  readonly isLoading = this.stateManager.isLoading;

  readonly tableConfig = computed<TableConfig<Client>>(() => ({
    title: 'Gestión de Clientes',
    columns: this.tableHelper.getTableColumns(),
    actions: this.tableHelper.getTableActions((action, client) => 
      this.handleTableAction({ action, item: client })
    ),
    showAddButton: true,
    addButtonLabel: 'Nuevo Cliente',
    onAdd: () => this.openCreateModal(),
    showSearch: true,
    searchPlaceholder: 'Buscar clientes...',
    emptyMessage: 'No hay clientes registrados',
    paginator: true,
    rows: this.stateManager.pageSize(),
    rowsPerPageOptions: [5, 10, 20, 50]
  }));

  ngOnInit(): void {
    this.loadClients();
  }

  handleTableAction(event: { action: string; item: Client }): void {
    this.actionHandler.execute(event.action, event.item, {
      onEdit: (client) => this.openEditModal(client),
      onRefreshData: () => this.loadClients()
    });
  }

  handlePageChanged(event: { page: number; limit: number }): void {
    this.stateManager.updatePagination(event.page, event.limit);
    this.loadClients();
  }

  handleSearchChanged(searchTerm: string): void {
    this.stateManager.updateSearch(searchTerm);
    this.loadClients();
  }

  handleClientSaved(): void {
    this.loadClients();
  }

  closeClientModal(): void {
    this.stateManager.closeModal();
  }

  private loadClients(): void {
    this.stateManager.setLoading(true);
    
    const params = this.stateManager.getPaginationParams();
    
    this.clientService.getClientsPaginated(params).subscribe({
      next: (response) => {
        this.stateManager.setPaginatedData(response);
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

  private openEditModal(client: Client): void {
    this.stateManager.openEditModal(client);
  }
}