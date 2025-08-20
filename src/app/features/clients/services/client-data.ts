import { inject, Injectable, signal } from '@angular/core';
import { DocumentType } from '@clients/enum/document-type.enum';
import { ClientQueryParams } from '@clients/interfaces/client-query-params.interface';
import { Client } from '@clients/interfaces/cliente.interface';
import { CreateClientRequest } from '@clients/interfaces/create-client-request.interface';
import { PaginatedClientsResponse } from '@clients/interfaces/paginated-clients-response.interface';
import { UpdateClientRequest } from '@clients/interfaces/update-client-request.interface';
import { Auth } from '@core/services/auth/auth';
import { HttpService } from '@core/services/http-service/http';
import { environment } from '@env/environment';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientData {
  private readonly http = inject(HttpService);
  private readonly auth = inject(Auth);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/customers`;
  
  private readonly _paginatedClientsState$ = new BehaviorSubject<PaginatedClientsResponse | null>(null);
  private readonly _clientsSignal = signal<Client[]>([]);
  private readonly _paginationInfoSignal = signal<{
    page: number;
    limit: number;
    total: number;
    next: string | null;
    prev: string | null;
  } | null>(null);

  readonly paginatedClients$ = this._paginatedClientsState$.asObservable();
  readonly clients = this._clientsSignal.asReadonly();
  readonly paginationInfo = this._paginationInfoSignal.asReadonly();


  private getAuthHeaders() {
    const token = this.auth.getToken();
    return this.http.setHeader('Authorization', `Bearer ${token}`);
  }

  private buildQueryParams(params: ClientQueryParams = {}): string {
    const searchParams = new URLSearchParams();
    
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    
    if (params.search && params.search.trim()) {
      searchParams.append('search', params.search.trim());
    }
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  getClientsPaginated(params: ClientQueryParams = {}): Observable<PaginatedClientsResponse> {
    const queryString = this.buildQueryParams(params);
    const url = `${this.API_URL}${queryString}`;
    
    return this.http.doGet<PaginatedClientsResponse>(url, this.getAuthHeaders()).pipe(
      tap(response => {
        this._paginatedClientsState$.next(response);
        this._clientsSignal.set(response.customers || []);
        this._paginationInfoSignal.set({
          page: response.page,
          limit: response.limit,
          total: response.total,
          next: response.next,
          prev: response.prev
        });
      }),
      catchError(error => {
        this._paginatedClientsState$.next(null);
        this._clientsSignal.set([]);
        this._paginationInfoSignal.set(null);
        return throwError(() => error);
      })
    );
  }

  getClients(): Observable<Client[]> {
    return this.http.doGet<PaginatedClientsResponse | Client[]>(this.API_URL, this.getAuthHeaders()).pipe(
      map(response => {
        let clientsArray: Client[] = [];
        
        if (Array.isArray(response)) {
          clientsArray = response;
        } else if (response && typeof response === 'object' && 'customers' in response) {
          clientsArray = response.customers || [];
        } else {
          clientsArray = [];
        }
        
        this._clientsSignal.set(clientsArray);
        return clientsArray;
      }),
      catchError(error => {
        this._clientsSignal.set([]);
        return throwError(() => error);
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.http.doGet<Client>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  createClient(clientData: CreateClientRequest): Observable<Client> {
    return this.http.doPost<CreateClientRequest, Client>(
      this.API_URL, 
      clientData, 
      this.getAuthHeaders()
    ).pipe(
      tap(newClient => {
        const currentResponse = this._paginatedClientsState$.value;
        if (currentResponse) {
          const updatedClients = [newClient, ...currentResponse.customers];
          const updatedResponse = {
            ...currentResponse,
            customers: updatedClients,
            total: currentResponse.total + 1
          };
          this._paginatedClientsState$.next(updatedResponse);
          this._clientsSignal.set(updatedClients);
        }
      }),
      catchError(error => {
        console.error('Error creating client:', error);
        return throwError(() => error);
      })
    );
  }

  updateClient(clientData: UpdateClientRequest): Observable<Client> {
    return this.http.doPut<UpdateClientRequest, Client>(
      `${this.API_URL}/${clientData.id}`, 
      clientData, 
      this.getAuthHeaders()
    ).pipe(
      tap(updatedClient => {
        const currentResponse = this._paginatedClientsState$.value;
        
        if (currentResponse && Array.isArray(currentResponse.customers)) {
          const updatedClients = currentResponse.customers.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          );
          const updatedResponse = {
            ...currentResponse,
            customers: updatedClients
          };
          this._paginatedClientsState$.next(updatedResponse);
          this._clientsSignal.set(updatedClients);
        }
      }),
      catchError(error => {
        console.error('Error updating client:', error);
        return throwError(() => error);
      })
    );
  }

  deleteClient(id: string): Observable<boolean> {
    return this.http.doDelete<{ message: string }>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        const currentResponse = this._paginatedClientsState$.value;
        
        if (currentResponse && Array.isArray(currentResponse.customers)) {
          const filteredClients = currentResponse.customers.filter(client => client.id !== id);
          const updatedResponse = {
            ...currentResponse,
            customers: filteredClients,
            total: Math.max(0, currentResponse.total - 1)
          };
          this._paginatedClientsState$.next(updatedResponse);
          this._clientsSignal.set(filteredClients);
        }
      }),
      map(() => true),
      catchError(error => {
        console.error('Error deleting client:', error);
        return throwError(() => error);
      })
    );
  }

  toggleClientStatus(id: string): Observable<Client> {
    return this.http.doPatch<{ message: string }, Client>(
      `${this.API_URL}/${id}/toggle-status`, 
      { message: 'Cambiar estado' }, 
      this.getAuthHeaders()
    ).pipe(
      tap(updatedClient => {
        const currentResponse = this._paginatedClientsState$.value;
        
        if (currentResponse && Array.isArray(currentResponse.customers)) {
          const updatedClients = currentResponse.customers.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          );
          const updatedResponse = {
            ...currentResponse,
            customers: updatedClients
          };
          this._paginatedClientsState$.next(updatedResponse);
          this._clientsSignal.set(updatedClients);
        }
      }),
      catchError(error => {
        console.error('Error toggling client status:', error);
        return throwError(() => error);
      })
    );
  }

  getDocumentTypeLabel(type: DocumentType): string {
    const labels = {
      [DocumentType.CC]: 'Cédula de Ciudadanía',
      [DocumentType.CE]: 'Cédula de Extranjería',
      [DocumentType.PASSPORT]: 'Pasaporte',
      [DocumentType.NIT]: 'NIT'
    };
    return labels[type] || type;
  }

  getDocumentTypeOptions(): { value: DocumentType; label: string }[] {
    return [
      { value: DocumentType.CC, label: 'Cédula de Ciudadanía' },
      { value: DocumentType.CE, label: 'Cédula de Extranjería' },
      { value: DocumentType.PASSPORT, label: 'Pasaporte' },
      { value: DocumentType.NIT, label: 'NIT' }
    ];
  }

  getFullName(client: Client): string {
    return `${client.firstName} ${client.lastName}`;
  }

  formatPhone(phone: string): string {
    return phone.replace(/(\+57\s?)(\d{3})(\s?)(\d{3})(\s?)(\d{4})/, '+57 $2 $4 $6');
  }

  resetState(): void {
    this._paginatedClientsState$.next(null);
    this._clientsSignal.set([]);
    this._paginationInfoSignal.set(null);
  }

  getCurrentClientsState(): Client[] {
    const currentClients = this._clientsSignal();
    return currentClients;
  }

  getCurrentPaginationInfo() {
    return this._paginationInfoSignal();
  }
}