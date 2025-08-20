import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RepairPriority } from '@clients/enum/repair-priority.enum';
import { RepairStatus } from '@clients/enum/repair-status.enum';
import { CreateRepairRequest } from '@clients/interfaces/create-reapair-request.interface';
import { Repair } from '@clients/interfaces/repair.interface';
import { UpdateRepairRequest } from '@clients/interfaces/update-repair-request.interface';
import { Notification } from '@core/services/notification/notification';
import { delay, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RepairPhoneClient {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(Notification);
  
  private repairsState = signal<Repair[]>([]);
  readonly repairs = this.repairsState.asReadonly();

  private mockRepairs: Repair[] = [
    {
      id: '1',
      phoneId: '1',
      clientId: '1',
      issue: 'Pantalla quebrada',
      description: 'Pantalla completamente fragmentada después de caída. Touch no responde.',
      status: RepairStatus.COMPLETED,
      priority: RepairPriority.HIGH,
      estimatedCost: 150000,
      finalCost: 145000,
      estimatedDuration: 4,
      actualDuration: 3.5,
      startDate: new Date('2024-01-20'),
      estimatedCompletionDate: new Date('2024-01-21'),
      completionDate: new Date('2024-01-21'),
      technicianNotes: 'Reemplazo de pantalla original. Calibración exitosa.',
      clientNotes: 'Cliente satisfecho con la reparación',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: '2',
      phoneId: '1',
      clientId: '1',
      issue: 'Batería se agota rápido',
      description: 'La batería dura menos de 4 horas con uso normal.',
      status: RepairStatus.IN_PROGRESS,
      priority: RepairPriority.MEDIUM,
      estimatedCost: 80000,
      estimatedDuration: 2,
      startDate: new Date('2024-04-15'),
      estimatedCompletionDate: new Date('2024-04-16'),
      technicianNotes: 'Diagnóstico: batería degradada. Reemplazo necesario.',
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-04-15')
    },
    {
      id: '3',
      phoneId: '2',
      clientId: '1',
      issue: 'No carga',
      description: 'El dispositivo no responde al conectar el cargador.',
      status: RepairStatus.WAITING_PARTS,
      priority: RepairPriority.HIGH,
      estimatedCost: 120000,
      estimatedDuration: 6,
      startDate: new Date('2024-04-10'),
      estimatedCompletionDate: new Date('2024-04-12'),
      technicianNotes: 'Puerto de carga dañado. Esperando repuesto.',
      createdAt: new Date('2024-04-10'),
      updatedAt: new Date('2024-04-11')
    },
    {
      id: '4',
      phoneId: '3',
      clientId: '2',
      issue: 'Cámara borrosa',
      description: 'Las fotos salen borrosas y con manchas.',
      status: RepairStatus.PENDING,
      priority: RepairPriority.LOW,
      estimatedCost: 95000,
      estimatedDuration: 3,
      startDate: new Date('2024-04-18'),
      estimatedCompletionDate: new Date('2024-04-19'),
      createdAt: new Date('2024-04-18'),
      updatedAt: new Date('2024-04-18')
    }
  ];

  constructor() {
    this.loadRepairs();
  }

  getRepairs(): Observable<Repair[]> {
    return of(this.mockRepairs).pipe(
      delay(300),
      map(repairs => {
        this.repairsState.set([...repairs]);
        return repairs;
      })
    );
  }

  getRepairsByPhoneId(phoneId: string): Observable<Repair[]> {
    const phoneRepairs = this.mockRepairs
      .filter(r => r.phoneId === phoneId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(phoneRepairs).pipe(delay(200));
  }

  getRepairsByClientId(clientId: string): Observable<Repair[]> {
    const clientRepairs = this.mockRepairs
      .filter(r => r.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(clientRepairs).pipe(delay(200));
  }

  getAllRepairsOrderedByDate(): Observable<Repair[]> {
    const sortedRepairs = [...this.mockRepairs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(sortedRepairs).pipe(delay(300));
  }

  getRepairById(id: string): Observable<Repair | null> {
    const repair = this.mockRepairs.find(r => r.id === id);
    return of(repair || null).pipe(delay(200));
  }

  createRepair(repairData: CreateRepairRequest): Observable<Repair> {
    const newRepair: Repair = {
      id: (this.mockRepairs.length + 1).toString(),
      clientId: repairData.phoneId,
      ...repairData,
      status: RepairStatus.PENDING,
      startDate: new Date(),
      estimatedCompletionDate: this.calculateEstimatedCompletion(repairData.estimatedDuration),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockRepairs.push(newRepair);
    this.repairsState.set([...this.mockRepairs]);

    return of(newRepair).pipe(delay(400));
  }

  updateRepair(repairData: UpdateRepairRequest): Observable<Repair> {
    const repairIndex = this.mockRepairs.findIndex(r => r.id === repairData.id);
    
    if (repairIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Reparación no encontrada' }
      }));
    }

    const updatedRepair = {
      ...this.mockRepairs[repairIndex],
      ...repairData,
      updatedAt: new Date()
    };

    if (repairData.status === RepairStatus.COMPLETED && !updatedRepair.completionDate) {
      updatedRepair.completionDate = new Date();
    }

    this.mockRepairs[repairIndex] = updatedRepair;
    this.repairsState.set([...this.mockRepairs]);

    return of(updatedRepair).pipe(delay(400));
  }

  deleteRepair(id: string): Observable<boolean> {
    const repairIndex = this.mockRepairs.findIndex(r => r.id === id);
    
    if (repairIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Reparación no encontrada' }
      }));
    }

    this.mockRepairs.splice(repairIndex, 1);
    this.repairsState.set([...this.mockRepairs]);

    return of(true).pipe(delay(300));
  }

  private loadRepairs(): void {
    this.getRepairs().subscribe();
  }

  private calculateEstimatedCompletion(hours: number): Date {
    const now = new Date();
    const workingHoursPerDay = 8;
    const daysNeeded = Math.ceil(hours / workingHoursPerDay);
    const completionDate = new Date(now);
    completionDate.setDate(now.getDate() + daysNeeded);
    return completionDate;
  }

  getStatusLabel(status: RepairStatus): string {
    const labels = {
      [RepairStatus.PENDING]: 'Pendiente',
      [RepairStatus.IN_PROGRESS]: 'En Progreso',
      [RepairStatus.WAITING_PARTS]: 'Esperando Repuestos',
      [RepairStatus.WAITING_CLIENT]: 'Esperando Cliente',
      [RepairStatus.COMPLETED]: 'Completada',
      [RepairStatus.CANCELLED]: 'Cancelada',
      [RepairStatus.DELIVERED]: 'Entregada'
    };
    return labels[status] || status;
  }

  getStatusColor(status: RepairStatus): string {
    const colors = {
      [RepairStatus.PENDING]: 'info',
      [RepairStatus.IN_PROGRESS]: 'primary',
      [RepairStatus.WAITING_PARTS]: 'warning',
      [RepairStatus.WAITING_CLIENT]: 'help',
      [RepairStatus.COMPLETED]: 'success',
      [RepairStatus.CANCELLED]: 'danger',
      [RepairStatus.DELIVERED]: 'success'
    };
    return colors[status] || 'secondary';
  }

  getPriorityLabel(priority: RepairPriority): string {
    const labels = {
      [RepairPriority.LOW]: 'Baja',
      [RepairPriority.MEDIUM]: 'Media',
      [RepairPriority.HIGH]: 'Alta',
      [RepairPriority.URGENT]: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getPriorityColor(priority: RepairPriority): string {
    const colors = {
      [RepairPriority.LOW]: 'success',
      [RepairPriority.MEDIUM]: 'info',
      [RepairPriority.HIGH]: 'warning',
      [RepairPriority.URGENT]: 'danger'
    };
    return colors[priority] || 'secondary';
  }

  getStatusOptions(): { value: RepairStatus; label: string }[] {
    return [
      { value: RepairStatus.PENDING, label: 'Pendiente' },
      { value: RepairStatus.IN_PROGRESS, label: 'En Progreso' },
      { value: RepairStatus.WAITING_PARTS, label: 'Esperando Repuestos' },
      { value: RepairStatus.WAITING_CLIENT, label: 'Esperando Cliente' },
      { value: RepairStatus.COMPLETED, label: 'Completada' },
      { value: RepairStatus.CANCELLED, label: 'Cancelada' },
      { value: RepairStatus.DELIVERED, label: 'Entregada' }
    ];
  }

  getPriorityOptions(): { value: RepairPriority; label: string }[] {
    return [
      { value: RepairPriority.LOW, label: 'Baja' },
      { value: RepairPriority.MEDIUM, label: 'Media' },
      { value: RepairPriority.HIGH, label: 'Alta' },
      { value: RepairPriority.URGENT, label: 'Urgente' }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
