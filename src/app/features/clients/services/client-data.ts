import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { DocumentType } from '@clients/enum/document-type.enum';
import { Client } from '@clients/interfaces/cliente.interface';
import { CreateClientRequest } from '@clients/interfaces/create-client-request.interface';
import { UpdateClientRequest } from '@clients/interfaces/update-client-request.interface';
import { Notification } from '@core/services/notification/notification';
import { delay, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientData {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(Notification);
  
  private clientsState = signal<Client[]>([]);
  readonly clients = this.clientsState.asReadonly();

  // Mock data for development
  private mockClients: Client[] = [
    {
      id: '1',
      firstName: 'Juan Carlos',
      lastName: 'Pérez García',
      email: 'juan.perez@email.com',
      phone: '+57 300 123 4567',
      address: 'Calle 15 #23-45, Bucaramanga',
      documentType: DocumentType.CC,
      documentNumber: '1098765432',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isActive: true,
      notes: 'Cliente frecuente, prefiere reparaciones rápidas'
    },
    {
      id: '2',
      firstName: 'María Elena',
      lastName: 'Rodríguez Martínez',
      email: 'maria.rodriguez@email.com',
      phone: '+57 301 987 6543',
      address: 'Carrera 27 #45-67, Bucaramanga',
      documentType: DocumentType.CC,
      documentNumber: '1087654321',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      isActive: true,
      notes: 'Empresaria, tiene varios dispositivos'
    },
    {
      id: '3',
      firstName: 'Carlos Alberto',
      lastName: 'González López',
      email: 'carlos.gonzalez@email.com',
      phone: '+57 302 456 7890',
      address: 'Avenida 33 #12-34, Floridablanca',
      documentType: DocumentType.CE,
      documentNumber: 'CE123456789',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
      isActive: false,
      notes: 'Cliente internacional, comunicación en inglés'
    },
    {
      id: '4',
      firstName: 'Ana Sofía',
      lastName: 'Hernández Ruiz',
      email: 'ana.hernandez@email.com',
      phone: '+57 303 789 0123',
      documentType: DocumentType.CC,
      documentNumber: '1076543210',
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date('2024-04-05'),
      isActive: true
    }
  ];

  constructor() {
    this.loadClients();
  }

  getClients(): Observable<Client[]> {
    return of(this.mockClients).pipe(
      delay(300),
      map(clients => {
        this.clientsState.set([...clients]);
        return clients;
      })
    );
  }

  getClientById(id: string): Observable<Client | null> {
    const client = this.mockClients.find(c => c.id === id);
    return of(client || null).pipe(delay(200));
  }

  createClient(clientData: CreateClientRequest): Observable<Client> {
    // Validate unique document number
    if (this.mockClients.some(c => c.documentNumber === clientData.documentNumber)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un cliente con este número de documento' }
      }));
    }

    // Validate unique email
    if (this.mockClients.some(c => c.email === clientData.email)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un cliente con este correo electrónico' }
      }));
    }

    const newClient: Client = {
      id: (this.mockClients.length + 1).toString(),
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.mockClients.push(newClient);
    this.clientsState.set([...this.mockClients]);

    return of(newClient).pipe(delay(400));
  }

  updateClient(clientData: UpdateClientRequest): Observable<Client> {
    const clientIndex = this.mockClients.findIndex(c => c.id === clientData.id);
    
    if (clientIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Cliente no encontrado' }
      }));
    }

    // Validate unique document number (excluding current client)
    if (clientData.documentNumber && 
        this.mockClients.some(c => c.documentNumber === clientData.documentNumber && c.id !== clientData.id)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un cliente con este número de documento' }
      }));
    }

    // Validate unique email (excluding current client)
    if (clientData.email && 
        this.mockClients.some(c => c.email === clientData.email && c.id !== clientData.id)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un cliente con este correo electrónico' }
      }));
    }

    const updatedClient = {
      ...this.mockClients[clientIndex],
      ...clientData,
      updatedAt: new Date()
    };

    this.mockClients[clientIndex] = updatedClient;
    this.clientsState.set([...this.mockClients]);

    return of(updatedClient).pipe(delay(400));
  }

  deleteClient(id: string): Observable<boolean> {
    const clientIndex = this.mockClients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Cliente no encontrado' }
      }));
    }

    this.mockClients.splice(clientIndex, 1);
    this.clientsState.set([...this.mockClients]);

    return of(true).pipe(delay(300));
  }

  toggleClientStatus(id: string): Observable<Client> {
    const clientIndex = this.mockClients.findIndex(c => c.id === id);
    
    if (clientIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Cliente no encontrado' }
      }));
    }

    this.mockClients[clientIndex].isActive = !this.mockClients[clientIndex].isActive;
    this.mockClients[clientIndex].updatedAt = new Date();
    this.clientsState.set([...this.mockClients]);

    return of(this.mockClients[clientIndex]).pipe(delay(200));
  }

  private loadClients(): void {
    this.getClients().subscribe();
  }

  // Utility methods
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
    // Simple phone formatting
    return phone.replace(/(\+57\s?)(\d{3})(\s?)(\d{3})(\s?)(\d{4})/, '+57 $2 $4 $6');
  }
}
