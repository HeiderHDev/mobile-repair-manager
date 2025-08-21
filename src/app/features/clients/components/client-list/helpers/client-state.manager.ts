import { computed, signal } from '@angular/core';
import { Client } from '@clients/interfaces/cliente.interface';
import { PaginatedResponse } from '@shared/interfaces/table/pagination-response.interface';

export class ClientStateManager {
  private readonly _paginatedData = signal<PaginatedResponse<Client> | null>(null);
  private readonly _showClientModal = signal(false);
  private readonly _selectedClient = signal<Client | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(10);
  private readonly _searchTerm = signal('');

  readonly paginatedData = computed<PaginatedResponse<Client> | Client[]>(() => 
    this._paginatedData() || []
  );
  readonly showClientModal = this._showClientModal.asReadonly();
  readonly selectedClient = this._selectedClient.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  setPaginatedData(data: PaginatedResponse<Client>): void {
    this._paginatedData.set(data);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  openCreateModal(): void {
    this._selectedClient.set(null);
    this._showClientModal.set(true);
  }

  openEditModal(client: Client): void {
    this._selectedClient.set(client);
    this._showClientModal.set(true);
  }

  closeModal(): void {
    this._showClientModal.set(false);
    this._selectedClient.set(null);
  }

  updatePagination(page: number, limit: number): void {
    this._currentPage.set(page);
    this._pageSize.set(limit);
  }

  updateSearch(searchTerm: string): void {
    this._searchTerm.set(searchTerm);
    this._currentPage.set(1);
  }

  getPaginationParams(): { page: number; limit: number; search?: string } {
    return {
      page: this._currentPage(),
      limit: this._pageSize(),
      search: this._searchTerm() || undefined
    };
  }
}