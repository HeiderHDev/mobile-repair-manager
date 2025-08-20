import { inject, Injectable, signal } from '@angular/core';
import { PhoneCondition } from '@clients/enum/phone-condition.enum';
import { CreatePhoneRequest } from '@clients/interfaces/create-phone-request.interface';
import { Phone } from '@clients/interfaces/phone.interface';
import { UpdatePhoneRequest } from '@clients/interfaces/update-phone-request.interface';
import { Auth } from '@core/services/auth/auth';
import { HttpService } from '@core/services/http-service/http';
import { environment } from '@env/environment';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneClient {
  private readonly http = inject(HttpService);
  private readonly auth = inject(Auth);
  private readonly API_URL = `${environment.apiUrl || 'http://localhost:3000'}/api/phones`;
  
  private readonly _phonesState$ = new BehaviorSubject<Phone[]>([]);
  private _phonesSignal = signal<Phone[]>([]);

  readonly phones$ = this._phonesState$.asObservable();
  readonly phones = this._phonesSignal.asReadonly();

  constructor() {
    this.loadPhones();
  }

  private getAuthHeaders() {
    const token = this.auth.getToken();
    return this.http.setHeader('Authorization', `Bearer ${token}`);
  }

  getPhones(): Observable<Phone[]> {
    return this.http.doGet<Phone[]>(this.API_URL, this.getAuthHeaders()).pipe(
      map(phones => {
        this._phonesState$.next(phones);
        this._phonesSignal.set(phones);
        return phones;
      }),
      catchError(error => {
        console.error('Error loading phones:', error);
        return throwError(() => error);
      })
    );
  }

  getPhonesByClientId(clientId: string): Observable<Phone[]> {
    return this.http.doGet<Phone[]>(
      `${this.API_URL}/customer/${clientId}`, 
      this.getAuthHeaders()
    ).pipe(
      catchError(error => {
        console.error('Error loading phones by client:', error);
        return throwError(() => error);
      })
    );
  }

  getPhoneById(id: string): Observable<Phone> {
    return this.http.doGet<Phone>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      catchError(error => {
        console.error('Error loading phone:', error);
        return throwError(() => error);
      })
    );
  }

  createPhone(phoneData: CreatePhoneRequest): Observable<Phone> {
    return this.http.doPost<CreatePhoneRequest, Phone>(
      this.API_URL, 
      phoneData, 
      this.getAuthHeaders()
    ).pipe(
      tap(newPhone => {
        const currentPhones = this._phonesState$.value;
        const updatedPhones = [newPhone, ...currentPhones];
        this._phonesState$.next(updatedPhones);
        this._phonesSignal.set(updatedPhones);
      }),
      catchError(error => {
        console.error('Error creating phone:', error);
        return throwError(() => error);
      })
    );
  }

  updatePhone(phoneData: UpdatePhoneRequest): Observable<Phone> {
    return this.http.doPut<UpdatePhoneRequest, Phone>(
      `${this.API_URL}/${phoneData.id}`, 
      phoneData, 
      this.getAuthHeaders()
    ).pipe(
      tap(updatedPhone => {
        const currentPhones = this._phonesState$.value;
        const updatedPhones = currentPhones.map(phone => 
          phone.id === updatedPhone.id ? updatedPhone : phone
        );
        this._phonesState$.next(updatedPhones);
        this._phonesSignal.set(updatedPhones);
      }),
      catchError(error => {
        console.error('Error updating phone:', error);
        return throwError(() => error);
      })
    );
  }

  deletePhone(id: string): Observable<boolean> {
    return this.http.doDelete<{ message: string }>(`${this.API_URL}/${id}`, this.getAuthHeaders()).pipe(
      tap(() => {
        const currentPhones = this._phonesState$.value;
        const filteredPhones = currentPhones.filter(phone => phone.id !== id);
        this._phonesState$.next(filteredPhones);
        this._phonesSignal.set(filteredPhones);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error deleting phone:', error);
        return throwError(() => error);
      })
    );
  }

  private loadPhones(): void {
    if (this.auth.isAuthenticated()) {
      this.getPhones().subscribe({
        error: (error) => console.error('Error loading initial phones:', error)
      });
    }
  }

  // Métodos de utilidad (mantener los existentes)
  getConditionLabel(condition: PhoneCondition): string {
    const labels = {
      [PhoneCondition.EXCELLENT]: 'Excelente',
      [PhoneCondition.GOOD]: 'Bueno',
      [PhoneCondition.FAIR]: 'Regular',
      [PhoneCondition.POOR]: 'Malo',
      [PhoneCondition.DAMAGED]: 'Dañado'
    };
    return labels[condition] || condition;
  }

  getConditionColor(condition: PhoneCondition): string {
    const colors = {
      [PhoneCondition.EXCELLENT]: 'success',
      [PhoneCondition.GOOD]: 'info',
      [PhoneCondition.FAIR]: 'warning',
      [PhoneCondition.POOR]: 'help',
      [PhoneCondition.DAMAGED]: 'danger'
    };
    return colors[condition] || 'secondary';
  }

  getConditionOptions(): { value: PhoneCondition; label: string }[] {
    return [
      { value: PhoneCondition.EXCELLENT, label: 'Excelente' },
      { value: PhoneCondition.GOOD, label: 'Bueno' },
      { value: PhoneCondition.FAIR, label: 'Regular' },
      { value: PhoneCondition.POOR, label: 'Malo' },
      { value: PhoneCondition.DAMAGED, label: 'Dañado' }
    ];
  }

  getPhoneDisplayName(phone: Phone): string {
    return `${phone.brand} ${phone.model}`;
  }

  formatImei(imei: string): string {
    return imei.replace(/(\d{6})(\d{2})(\d{6})(\d{1})/, '$1-$2-$3-$4');
  }
}