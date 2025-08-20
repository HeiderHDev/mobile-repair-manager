import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';

// Interfaces
import { Client } from '@clients/interfaces/cliente.interface';
import { CreateClientRequest } from '@clients/interfaces/create-client-request.interface';
import { UpdateClientRequest } from '@clients/interfaces/update-client-request.interface';
import { DocumentType } from '@clients/enum/document-type.enum';
import { HttpService } from '@core/services/http-service/http';
import { Auth } from '@core/services/auth/auth';

// Interfaz para respuesta paginada del backend
interface PaginatedClientsResponse {
  page: number;
  limit: number;
  total: number;
  next: string | null;
  prev: string | null;
  customers: Client[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientData {
  private readonly http = inject(HttpService);
  private readonly auth = inject(Auth);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/customers`;
  
  // Estados inicializados correctamente
  private readonly _clientsState$ = new BehaviorSubject<Client[]>([]);
  private _clientsSignal = signal<Client[]>([]);

  readonly clients$ = this._clientsState$.asObservable();
  readonly clients = this._clientsSignal.asReadonly();

  constructor() {
    this.loadClients();
  }

  private getAuthHeaders() {
    const token = this.auth.getToken();
    return this.http.setHeader('Authorization', `Bearer ${token}`);
  }

  getClients(): Observable<Client[]> {
    console.log('🔄 Cargando clientes desde:', this.API_URL);
    
    return this.http.doGet<PaginatedClientsResponse>(this.API_URL, this.getAuthHeaders()).pipe(
      map(response => {
        console.log('📥 Respuesta del backend:', response);
        
        // Extraer el array de clientes de la respuesta paginada
        const clientsArray = response?.customers || [];
        console.log('👥 Clientes extraídos:', clientsArray);
        
        // Actualizar estados
        this._clientsState$.next(clientsArray);
        this._clientsSignal.set(clientsArray);
        
        return clientsArray;
      }),
      catchError(error => {
        console.error('❌ Error loading clients:', error);
        // En caso de error, asegurar que el estado quede vacío
        this._clientsState$.next([]);
        this._clientsSignal.set([]);
        return throwError(() => error);
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.http.doGet<Client>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      catchError(error => {
        console.error('Error loading client:', error);
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
        console.log('✅ Cliente creado:', newClient);
        const currentClients = this._clientsState$.value || [];
        const updatedClients = [newClient, ...currentClients];
        this._clientsState$.next(updatedClients);
        this._clientsSignal.set(updatedClients);
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
        console.log('✅ Cliente actualizado:', updatedClient);
        const currentClients = this._clientsState$.value || [];
        
        if (!Array.isArray(currentClients)) {
          console.warn('⚠️ currentClients no es un array, recargando datos');
          this.loadClients();
          return;
        }

        const updatedClients = currentClients.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
        this._clientsState$.next(updatedClients);
        this._clientsSignal.set(updatedClients);
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
        console.log('🗑️ Cliente eliminado:', id);
        const currentClients = this._clientsState$.value || [];
        
        if (!Array.isArray(currentClients)) {
          console.warn('⚠️ currentClients no es un array, recargando datos');
          this.loadClients();
          return;
        }

        const filteredClients = currentClients.filter(client => client.id !== id);
        this._clientsState$.next(filteredClients);
        this._clientsSignal.set(filteredClients);
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
        console.log('🔄 Estado del cliente cambiado:', updatedClient);
        const currentClients = this._clientsState$.value || [];
        
        if (!Array.isArray(currentClients)) {
          console.warn('⚠️ currentClients no es un array, recargando datos');
          this.loadClients();
          return;
        }

        const updatedClients = currentClients.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
        this._clientsState$.next(updatedClients);
        this._clientsSignal.set(updatedClients);
      }),
      catchError(error => {
        console.error('Error toggling client status:', error);
        return throwError(() => error);
      })
    );
  }

  private loadClients(): void {
    console.log('🚀 Inicializando carga de clientes...');
    console.log('🔐 Usuario autenticado:', this.auth.isAuthenticated());
    
    if (this.auth.isAuthenticated()) {
      this.getClients().subscribe({
        next: (clients) => {
          console.log('✅ Clientes cargados exitosamente:', clients.length);
        },
        error: (error) => {
          console.error('❌ Error loading initial clients:', error);
        }
      });
    } else {
      console.warn('⚠️ Usuario no autenticado, no se cargarán clientes');
    }
  }

  // Métodos de utilidad
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

  // Métodos de debugging
  resetState(): void {
    console.log('🔄 Reseteando estado de clientes');
    this._clientsState$.next([]);
    this._clientsSignal.set([]);
  }

  getCurrentClientsState(): Client[] {
    const currentState = this._clientsState$.value;
    console.log('📊 Estado actual de clientes:', currentState);
    return Array.isArray(currentState) ? currentState : [];
  }

  // Método para forzar recarga
  forceReload(): void {
    console.log('🔄 Forzando recarga de clientes...');
    this.loadClients();
  }
}