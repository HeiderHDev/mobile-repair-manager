import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Stats Cards -->
      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Reparaciones Activas</p>
            <p class="text-2xl font-bold text-blue-600">24</p>
          </div>
          <i class="pi pi-wrench text-3xl text-blue-500"></i>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes</p>
            <p class="text-2xl font-bold text-green-600">156</p>
          </div>
          <i class="pi pi-users text-3xl text-green-500"></i>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Ingresos del Mes</p>
            <p class="text-2xl font-bold text-purple-600">$12,450</p>
          </div>
          <i class="pi pi-dollar text-3xl text-purple-500"></i>
        </div>
      </p-card>

      <p-card>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pendientes</p>
            <p class="text-2xl font-bold text-orange-600">8</p>
          </div>
          <i class="pi pi-clock text-3xl text-orange-500"></i>
        </div>
      </p-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Repairs -->
      <p-card header="Reparaciones Recientes">
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="pi pi-mobile text-blue-500"></i>
              <div>
                <p class="font-medium">iPhone 12 Pro</p>
                <p class="text-sm text-gray-600">Pantalla rota - Juan Pérez</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En Proceso</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="pi pi-mobile text-green-500"></i>
              <div>
                <p class="font-medium">Samsung Galaxy S21</p>
                <p class="text-sm text-gray-600">Batería - María García</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completado</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="pi pi-mobile text-red-500"></i>
              <div>
                <p class="font-medium">Xiaomi Mi 11</p>
                <p class="text-sm text-gray-600">Agua - Carlos López</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Urgente</span>
          </div>
        </div>

        <div class="mt-4">
          <p-button label="Ver Todas" icon="pi pi-arrow-right" [text]="true" severity="secondary"></p-button>
        </div>
      </p-card>

      <!-- Quick Actions -->
      <p-card header="Acciones Rápidas">
        <div class="grid grid-cols-2 gap-4">
          <p-button 
            label="Nueva Reparación" 
            icon="pi pi-plus" 
            class="w-full"
            severity="primary"
            (click)="testSpinner()">
          </p-button>
          
          <p-button 
            label="Nuevo Cliente" 
            icon="pi pi-user-plus" 
            class="w-full"
            severity="secondary">
          </p-button>
          
          <p-button 
            label="Inventario" 
            icon="pi pi-box" 
            class="w-full"
            severity="info">
          </p-button>
          
          <p-button 
            label="Reportes" 
            icon="pi pi-chart-bar" 
            class="w-full"
            severity="help">
          </p-button>
        </div>

        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-medium text-blue-900 mb-2">Recordatorio</h4>
          <p class="text-sm text-blue-700">
            Tienes 3 reparaciones que deben entregarse hoy. 
            <a href="#" class="underline">Ver detalles</a>
          </p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
    }

    :host ::ng-deep .p-card .p-card-header {
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    :host ::ng-deep .p-button {
      border-radius: 0.5rem;
    }
  `]
})
export class DashboardComponent {
  private http = inject(HttpClient);

  testSpinner(): void {
    // Make a test HTTP request to trigger the loading interceptor and show spinner
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: (data) => {
        console.log('Test request completed:', data);
      },
      error: (error) => {
        console.error('Test request failed:', error);
      }
    });
  }
}
