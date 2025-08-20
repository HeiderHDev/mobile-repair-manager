import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RepairStatus } from '@clients/enum/repair-status.enum';
import { ClientData } from '@clients/services/client-data';
import { PhoneClient } from '@clients/services/phone-client';
import { RepairPhoneClient } from '@clients/services/repair-phone-client';
import { Notification } from '@core/services/notification/notification';
import { Client } from '@clients/interfaces/cliente.interface';
import { Phone } from '@clients/interfaces/phone.interface';
import { Repair } from '@clients/interfaces/repair.interface';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { RepairFormModal } from '../repair-form-modal/repair-form-modal';
import { TimelineModule } from 'primeng/timeline';

@Component({
  selector: 'app-phone-repairs',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TimelineModule,
    DividerModule,
    SkeletonModule,
    DialogModule,
    RepairFormModal
  ],
  templateUrl: './phone-repairs.html',
  styles: `
    .phone-repairs-view {
      max-width: 1200px;
      margin: 0 auto;
    }

    :host ::ng-deep .customized-timeline .p-timeline-event-content {
      line-height: 1;
    }

    .timeline-content {
      width: 100%;
      margin: 1rem 0;
    }

    .timeline-right {
      margin-left: 2rem;
    }

    .timeline-left {
      margin-right: 2rem;
    }

    @media (max-width: 768px) {
      .timeline-right,
      .timeline-left {
        margin-left: 1rem;
        margin-right: 1rem;
      }
    }

    :host ::ng-deep .p-timeline .p-timeline-event-marker {
      border: 2px solid var(--surface-border);
      border-radius: 50%;
    }

    :host ::ng-deep .p-card .p-card-content {
      padding: 1.5rem;
    }

    :host ::ng-deep .p-card .p-card-footer {
      padding: 0 1.5rem 1.5rem;
    }
  `
})
export class PhoneRepairs implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly clientService = inject(ClientData);
  readonly phoneService = inject(PhoneClient);
  readonly repairService = inject(RepairPhoneClient);
  private readonly notificationService = inject(Notification);

  readonly client = signal<Client | null>(null);
  readonly phone = signal<Phone | null>(null);
  readonly repairs = signal<Repair[]>([]);
  readonly showRepairModal = signal(false);
  readonly selectedRepair = signal<Repair | null>(null);
  readonly phoneId = signal<string>('');
  readonly clientId = signal<string>('');
  readonly currentCustomerId = computed(() => this.clientId());

  readonly timelineEvents = computed(() => {
    return this.repairs().map(repair => ({
      repair,
      date: new Date(repair.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      icon: this.getRepairIcon(repair.status),
      color: this.getRepairColor(repair.status),
      status: this.repairService.getStatusLabel(repair.status)
    }));
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const clientId = params['clientId'];
      const phoneId = params['phoneId'];
      
      if (clientId && phoneId) {
        this.clientId.set(clientId);
        this.phoneId.set(phoneId);
        this.loadData(clientId, phoneId);
      }
    });
  }

  isWarrantyExpired(warrantyDate: Date): boolean {
    return new Date(warrantyDate) < new Date();
  }

  goBackToPhones(): void {
    this.router.navigate(['/clients', this.clientId(), 'phones']);
  }

  openNewRepairModal(): void {
    this.selectedRepair.set(null);
    this.showRepairModal.set(true);
  }

  editRepair(repair: Repair): void {
    this.selectedRepair.set(repair);
    this.showRepairModal.set(true);
  }

  closeRepairModal(): void {
    this.showRepairModal.set(false);
    this.selectedRepair.set(null);
  }

  handleRepairSaved(): void {
    this.loadRepairs();
  }

  deleteRepair(repairId: string): void {
    this.repairService.deleteRepair(repairId).subscribe({
      next: () => {
        this.loadRepairs();
        this.notificationService.success(
          'Reparación eliminada',
          'La reparación ha sido eliminada exitosamente'
        );
      },
      error: (error) => {
        this.notificationService.error(
          'Error al eliminar la reparación',
          'No se pudo eliminar la reparación'
        );
        console.error(error);
      }
    });
  }

  private loadData(clientId: string, phoneId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        if (client) {
          this.client.set(client);
        }
      }
    });

    this.phoneService.getPhoneById(phoneId).subscribe({
      next: (phone) => {
        if (phone) {
          this.phone.set(phone);
        } else {
          this.notificationService.error(
            'Teléfono no encontrado',
            'El teléfono solicitado no existe'
          );
          this.goBackToPhones();
        }
      },
      error: (error) => {
        this.notificationService.error(
          'Error al cargar el teléfono',
          'No se pudo cargar el teléfono'
        );
        console.error(error);
        this.goBackToPhones();
      }
    });

    this.loadRepairs();
  }

  private loadRepairs(): void {
    this.repairService.getRepairsByPhoneId(this.phoneId()).subscribe({
      next: (repairs) => {
        this.repairs.set(repairs);
      },
      error: (error) => {
        this.notificationService.error(
          'Error al cargar las reparaciones',
          'No se pudo cargar las reparaciones'
        );
        console.error(error);
      }
    });
  }

  private getRepairIcon(status: RepairStatus): string {
    const icons = {
      [RepairStatus.PENDING]: 'pi pi-clock',
      [RepairStatus.IN_PROGRESS]: 'pi pi-cog',
      [RepairStatus.WAITING_PARTS]: 'pi pi-pause',
      [RepairStatus.WAITING_CLIENT]: 'pi pi-user-edit',
      [RepairStatus.COMPLETED]: 'pi pi-check',
      [RepairStatus.CANCELLED]: 'pi pi-times',
      [RepairStatus.DELIVERED]: 'pi pi-send'
    };
    return icons[status] || 'pi pi-info-circle';
  }

  private getRepairColor(status: RepairStatus): string {
    const colors = {
      [RepairStatus.PENDING]: '#3B82F6',
      [RepairStatus.IN_PROGRESS]: '#8B5CF6',
      [RepairStatus.WAITING_PARTS]: '#F59E0B',
      [RepairStatus.WAITING_CLIENT]: '#6B7280',
      [RepairStatus.COMPLETED]: '#10B981',
      [RepairStatus.CANCELLED]: '#EF4444',
      [RepairStatus.DELIVERED]: '#059669'
    };
    return colors[status] || '#6B7280';
  }
}
