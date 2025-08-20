import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';

// Interfaces
import { Repair } from '@clients/interfaces/repair.interface';
import { CreateRepairRequest } from '@clients/interfaces/create-reapair-request.interface';
import { UpdateRepairRequest } from '@clients/interfaces/update-repair-request.interface';
import { RepairStatus } from '@clients/enum/repair-status.enum';
import { RepairPriority } from '@clients/enum/repair-priority.enum';
import { HttpService } from '@core/services/http-service/http';
import { Auth } from '@core/services/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class RepairPhoneClient {
  private readonly http = inject(HttpService);
  private readonly auth = inject(Auth);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/repairs`;
  
  private readonly _repairsState$ = new BehaviorSubject<Repair[]>([]);
  private _repairsSignal = signal<Repair[]>([]);

  readonly repairs$ = this._repairsState$.asObservable();
  readonly repairs = this._repairsSignal.asReadonly();

  constructor() {
    this.loadRepairs();
  }

  private getAuthHeaders() {
    const token = this.auth.getToken();
    return this.http.setHeader('Authorization', `Bearer ${token}`);
  }

  getRepairs(): Observable<Repair[]> {
    return this.http.doGet<{ repairs: Repair[] } | Repair[]>(this.API_URL, this.getAuthHeaders()).pipe(
      map(response => {
        // El backend devuelve { repairs: [], page, limit, total } o directamente Repair[]
        const repairs = Array.isArray(response) ? response : response.repairs;
        this._repairsState$.next(repairs);
        this._repairsSignal.set(repairs);
        return repairs;
      }),
      catchError(error => {
        console.error('Error loading repairs:', error);
        return throwError(() => error);
      })
    );
  }

  getRepairsByPhoneId(phoneId: string): Observable<Repair[]> {
    return this.http.doGet<Repair[]>(
      `${this.API_URL}/phone/${phoneId}`, 
      this.getAuthHeaders()
    ).pipe(
      map(repairs => {
        // Ordenar por fecha (más reciente primero)
        return repairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }),
      catchError(error => {
        console.error('Error loading repairs by phone:', error);
        return throwError(() => error);
      })
    );
  }

  getRepairsByClientId(clientId: string): Observable<Repair[]> {
    return this.http.doGet<Repair[]>(
      `${this.API_URL}/customer/${clientId}`, 
      this.getAuthHeaders()
    ).pipe(
      map(repairs => {
        // Ordenar por fecha (más reciente primero)
        return repairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }),
      catchError(error => {
        console.error('Error loading repairs by client:', error);
        return throwError(() => error);
      })
    );
  }

  getAllRepairsOrderedByDate(): Observable<Repair[]> {
    return this.getRepairs().pipe(
      map(repairs => repairs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }

  getRepairById(id: string): Observable<Repair> {
    return this.http.doGet<Repair>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      catchError(error => {
        console.error('Error loading repair:', error);
        return throwError(() => error);
      })
    );
  }

  createRepair(repairData: CreateRepairRequest): Observable<Repair> {
    return this.http.doPost<CreateRepairRequest, Repair>(
      this.API_URL, 
      repairData, 
      this.getAuthHeaders()
    ).pipe(
      tap(newRepair => {
        const currentRepairs = this._repairsState$.value;
        const updatedRepairs = [newRepair, ...currentRepairs];
        this._repairsState$.next(updatedRepairs);
        this._repairsSignal.set(updatedRepairs);
      }),
      catchError(error => {
        console.error('Error creating repair:', error);
        return throwError(() => error);
      })
    );
  }

  updateRepair(repairData: UpdateRepairRequest): Observable<Repair> {
    return this.http.doPut<UpdateRepairRequest, Repair>(
      `${this.API_URL}/${repairData.id}`, 
      repairData, 
      this.getAuthHeaders()
    ).pipe(
      tap(updatedRepair => {
        const currentRepairs = this._repairsState$.value;
        const updatedRepairs = currentRepairs.map(repair => 
          repair.id === updatedRepair.id ? updatedRepair : repair
        );
        this._repairsState$.next(updatedRepairs);
        this._repairsSignal.set(updatedRepairs);
      }),
      catchError(error => {
        console.error('Error updating repair:', error);
        return throwError(() => error);
      })
    );
  }

  deleteRepair(id: string): Observable<boolean> {
    return this.http.doDelete<{ message: string }>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        const currentRepairs = this._repairsState$.value;
        const filteredRepairs = currentRepairs.filter(repair => repair.id !== id);
        this._repairsState$.next(filteredRepairs);
        this._repairsSignal.set(filteredRepairs);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error deleting repair:', error);
        return throwError(() => error);
      })
    );
  }

  getRepairStatistics(): Observable<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  }> {
    return this.http.doGet<{
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
    }>(`${this.API_URL}/statistics`, this.getAuthHeaders()).pipe(
      catchError(error => {
        console.error('Error loading repair statistics:', error);
        return throwError(() => error);
      })
    );
  }

  private loadRepairs(): void {
    if (this.auth.isAuthenticated()) {
      this.getRepairs().subscribe({
        error: (error) => console.error('Error loading initial repairs:', error)
      });
    }
  }

  // Métodos de utilidad (mantener los existentes)
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

  private calculateEstimatedCompletion(hours: number): Date {
    const now = new Date();
    const workingHoursPerDay = 8;
    const daysNeeded = Math.ceil(hours / workingHoursPerDay);
    const completionDate = new Date(now);
    completionDate.setDate(now.getDate() + daysNeeded);
    return completionDate;
  }
}