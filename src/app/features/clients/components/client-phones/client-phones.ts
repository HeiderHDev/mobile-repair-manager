import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientData } from '@clients/services/client-data';
import { PhoneClient } from '@clients/services/phone-client';
import { Notification } from '@core/services/notification/notification';
import { Client } from '@clients/interfaces/cliente.interface';
import { Phone } from '@clients/interfaces/phone.interface';
import { PhoneFormModal } from "../phone-form-modal/phone-form-modal";

@Component({
  selector: 'app-client-phones',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    SkeletonModule,
    PhoneFormModal
],
  templateUrl: './client-phones.html',
  styles: `
    .client-phones-view {
      max-width: 1200px;
      margin: 0 auto;
    }

    :host ::ng-deep .p-card .p-card-content {
      padding: 1.5rem;
    }

    :host ::ng-deep .p-card .p-card-footer {
      padding: 0 1.5rem 1.5rem;
    }
  `
})
export class ClientPhones implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly clientService = inject(ClientData);
  readonly phoneService = inject(PhoneClient);
  private readonly notificationService = inject(Notification);

  
  showPhoneModal = signal(false);
  selectedPhone = signal<Phone | null>(null);

  client = signal<Client | null>(null);
  phones = signal<Phone[]>([]);
  isLoading = signal(false);
  clientId = signal<string>('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['clientId'];
      if (id) {
        this.clientId.set(id);
        this.loadClientData(id);
        this.loadClientPhones(id);
      }
    });
  }

  getClientFullName(client: Client): string {
    return this.clientService.getFullName(client);
  }

  isWarrantyExpired(warrantyDate: Date): boolean {
    return new Date(warrantyDate) < new Date();
  }

  goBackToClients(): void {
    this.router.navigate(['/clients']);
  }

  closePhoneModal(): void {
    this.showPhoneModal.set(false);
    this.selectedPhone.set(null);
  }

  handlePhoneSaved(): void {
    this.loadClientPhones(this.clientId());
  }

  openAddPhoneModal(): void {
    this.selectedPhone.set(null);
    this.showPhoneModal.set(true);
  }

  editPhone(phone: Phone): void {
    this.selectedPhone.set(phone);
    this.showPhoneModal.set(true);
  }

  deletePhone(phoneId: string): void {
    this.phoneService.deletePhone(phoneId).subscribe({
      next: () => {
        this.loadClientPhones(this.clientId());
        this.notificationService.success(
          'Teléfono eliminado',
          'El teléfono ha sido eliminado exitosamente'
        );
      },
      error: (error) => {
        this.notificationService.error(
          'Error al eliminar teléfono',
          'Ocurrió un error al eliminar el teléfono'
        );
        console.error(error);
      }
    });
  }

  viewPhoneRepairs(phoneId: string): void {
    this.router.navigate(['/clients', this.clientId(), 'phones', phoneId, 'repairs']);
  }

  private loadClientData(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        if (client) {
          this.client.set(client);
        } else {
          this.notificationService.error(
            'Cliente no encontrado',
            'El cliente solicitado no existe'
          );
          this.goBackToClients();
        }
      },
      error: (error) => {
        this.notificationService.error(
          'Error al cargar cliente',
          'Ocurrió un error al cargar el cliente'
        );
        console.error(error);
        this.goBackToClients();
      }
    });
  }

  private loadClientPhones(clientId: string): void {
    this.phoneService.getPhonesByClientId(clientId).subscribe({
      next: (phones) => {
        this.phones.set(phones);
      },
      error: (error) => {
        this.notificationService.error(
          'Error al cargar teléfonos',
          'Ocurrió un error al cargar los teléfonos'
        );
        console.error(error);
      }
    });
  }
}