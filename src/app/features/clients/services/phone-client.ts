import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PhoneCondition } from '@clients/enum/phone-condition.enum';
import { CreatePhoneRequest } from '@clients/interfaces/create-phone-request.interface';
import { Phone } from '@clients/interfaces/phone.interface';
import { UpdatePhoneRequest } from '@clients/interfaces/update-phone-request.interface';
import { Notification } from '@core/services/notification/notification';
import { delay, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneClient {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(Notification);
  
  private phonesState = signal<Phone[]>([]);
  readonly phones = this.phonesState.asReadonly();

  private mockPhones: Phone[] = [
    {
      id: '1',
      clientId: '1',
      brand: 'Samsung',
      model: 'Galaxy S23',
      imei: '123456789012345',
      color: 'Negro',
      purchaseDate: new Date('2023-03-15'),
      warrantyExpiry: new Date('2025-03-15'),
      condition: PhoneCondition.GOOD,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      isActive: true,
      notes: 'Protector de pantalla instalado'
    },
    {
      id: '2',
      clientId: '1',
      brand: 'iPhone',
      model: '14 Pro',
      imei: '987654321098765',
      color: 'Azul',
      purchaseDate: new Date('2023-09-22'),
      warrantyExpiry: new Date('2024-09-22'),
      condition: PhoneCondition.EXCELLENT,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      isActive: true
    },
    {
      id: '3',
      clientId: '2',
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      imei: '456789012345678',
      color: 'Blanco',
      condition: PhoneCondition.FAIR,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
      isActive: true,
      notes: 'Pequeños rayones en la pantalla'
    },
    {
      id: '4',
      clientId: '3',
      brand: 'Huawei',
      model: 'P50 Pro',
      imei: '789012345678901',
      color: 'Dorado',
      condition: PhoneCondition.DAMAGED,
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-04-12'),
      isActive: false,
      notes: 'Pantalla quebrada, necesita reemplazo'
    }
  ];

  constructor() {
    this.loadPhones();
  }

  getPhones(): Observable<Phone[]> {
    return of(this.mockPhones).pipe(
      delay(300),
      map((phones: Phone[]) => {
        this.phonesState.set([...phones]);
        return phones;
      })
    );
  }

  getPhonesByClientId(clientId: string): Observable<Phone[]> {
    const clientPhones = this.mockPhones.filter(p => p.clientId === clientId);
    return of(clientPhones).pipe(delay(200));
  }

  getPhoneById(id: string): Observable<Phone | null> {
    const phone = this.mockPhones.find(p => p.id === id);
    return of(phone || null).pipe(delay(200));
  }

  createPhone(phoneData: CreatePhoneRequest): Observable<Phone> {
    if (this.mockPhones.some(p => p.imei === phoneData.imei)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un teléfono registrado con este IMEI' }
      }));
    }

    const newPhone: Phone = {
      id: (this.mockPhones.length + 1).toString(),
      ...phoneData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.mockPhones.push(newPhone);
    this.phonesState.set([...this.mockPhones]);

    return of(newPhone).pipe(delay(400));
  }

  updatePhone(phoneData: UpdatePhoneRequest): Observable<Phone> {
    const phoneIndex = this.mockPhones.findIndex(p => p.id === phoneData.id);
    
    if (phoneIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Teléfono no encontrado' }
      }));
    }

    if (phoneData.imei && 
        this.mockPhones.some(p => p.imei === phoneData.imei && p.id !== phoneData.id)) {
      return throwError(() => ({
        status: 409,
        error: { message: 'Ya existe un teléfono registrado con este IMEI' }
      }));
    }

    const updatedPhone = {
      ...this.mockPhones[phoneIndex],
      ...phoneData,
      updatedAt: new Date()
    };

    this.mockPhones[phoneIndex] = updatedPhone;
    this.phonesState.set([...this.mockPhones]);

    return of(updatedPhone).pipe(delay(400));
  }

  deletePhone(id: string): Observable<boolean> {
    const phoneIndex = this.mockPhones.findIndex(p => p.id === id);
    
    if (phoneIndex === -1) {
      return throwError(() => ({
        status: 404,
        error: { message: 'Teléfono no encontrado' }
      }));
    }

    this.mockPhones.splice(phoneIndex, 1);
    this.phonesState.set([...this.mockPhones]);

    return of(true).pipe(delay(300));
  }

  private loadPhones(): void {
    this.getPhones().subscribe();
  }

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
