import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';

// Interfaces (las que me mostraste antes)
import { Client } from '@clients/interfaces/cliente.interface';
import { CreateClientRequest } from '@clients/interfaces/create-client-request.interface';
import { UpdateClientRequest } from '@clients/interfaces/update-client-request.interface';
import { DocumentType } from '@clients/enum/document-type.enum';
import { HttpService } from '@core/services/http-service/http';
import { Auth } from '@core/services/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class ClientData {
  private readonly http = inject(HttpService);
  private readonly auth = inject(Auth);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/customers`;
  
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
    return this.http.doGet<Client[]>(this.API_URL, this.getAuthHeaders()).pipe(
      map(clients => {
        this._clientsState$.next(clients);
        this._clientsSignal.set(clients);
        return clients;
      }),
      catchError(error => {
        console.error('Error loading clients:', error);
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
        const currentClients = this._clientsState$.value;
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
        const currentClients = this._clientsState$.value;
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
        const currentClients = this._clientsState$.value;
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
      { message: 'Cliente desactivado' }, 
      this.getAuthHeaders()
    ).pipe(
      tap(updatedClient => {
        const currentClients = this._clientsState$.value;
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
    if (this.auth.isAuthenticated()) {
      this.getClients().subscribe({
        error: (error) => console.error('Error loading initial clients:', error)
      });
    }
  }

  // Métodos de utilidad (mantener los que ya tienes)
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
}