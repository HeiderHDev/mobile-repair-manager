import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, PanelMenuModule],
  template: `
    <!-- Overlay for mobile -->
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      (click)="onCloseSidebar()">
    </div>

    <!-- Sidebar -->
    <aside 
      class="fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">
      
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">Menú</h2>
          <p-button 
            icon="pi pi-times"
            [text]="true"
            severity="secondary"
            size="small"
            class="lg:hidden"
            (click)="onCloseSidebar()">
          </p-button>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-4">
        <p-panelMenu [model]="menuItems" [multiple]="false"></p-panelMenu>
      </nav>

      <!-- Sidebar Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div class="text-xs text-gray-500 text-center">
          <p>Mobile Repair Manager</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host ::ng-deep .p-panelmenu {
      border: none;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-panel {
      border: none;
      margin-bottom: 0.5rem;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-header {
      border: none;
      border-radius: 0.5rem;
      margin-bottom: 0.25rem;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-header:not(.p-highlight):not(.p-disabled):hover {
      background-color: #f3f4f6;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-header.p-highlight {
      background-color: #dbeafe;
      color: #1e40af;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-header-link {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
    }

    :host ::ng-deep .p-panelmenu .p-panelmenu-content {
      border: none;
      background: transparent;
      padding: 0;
    }

    :host ::ng-deep .p-panelmenu .p-menuitem-link {
      padding: 0.5rem 1rem 0.5rem 2rem;
      border-radius: 0.375rem;
      margin: 0.125rem 0;
      color: #6b7280;
    }

    :host ::ng-deep .p-panelmenu .p-menuitem-link:hover {
      background-color: #f9fafb;
      color: #374151;
    }

    :host ::ng-deep .p-panelmenu .p-menuitem-link.router-link-active {
      background-color: #dbeafe;
      color: #1e40af;
    }
  `]
})
export class Sidebar {
  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Reparaciones',
      icon: 'pi pi-wrench',
      items: [
        {
          label: 'Nueva Reparación',
          icon: 'pi pi-plus',
          routerLink: '/repairs/new'
        },
        {
          label: 'Lista de Reparaciones',
          icon: 'pi pi-list',
          routerLink: '/repairs'
        },
        {
          label: 'Historial',
          icon: 'pi pi-history',
          routerLink: '/repairs/history'
        }
      ]
    },
    {
      label: 'Clientes',
      icon: 'pi pi-users',
      items: [
        {
          label: 'Lista de Clientes',
          icon: 'pi pi-list',
          routerLink: '/customers'
        },
        {
          label: 'Nuevo Cliente',
          icon: 'pi pi-user-plus',
          routerLink: '/customers/new'
        }
      ]
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      items: [
        {
          label: 'Repuestos',
          icon: 'pi pi-cog',
          routerLink: '/inventory/parts'
        },
        {
          label: 'Herramientas',
          icon: 'pi pi-wrench',
          routerLink: '/inventory/tools'
        },
        {
          label: 'Stock Bajo',
          icon: 'pi pi-exclamation-triangle',
          routerLink: '/inventory/low-stock'
        }
      ]
    },
    {
      label: 'Finanzas',
      icon: 'pi pi-dollar',
      items: [
        {
          label: 'Facturación',
          icon: 'pi pi-file',
          routerLink: '/finance/billing'
        },
        {
          label: 'Reportes',
          icon: 'pi pi-chart-bar',
          routerLink: '/finance/reports'
        }
      ]
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'General',
          icon: 'pi pi-sliders-h',
          routerLink: '/settings/general'
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          routerLink: '/settings/users'
        }
      ]
    }
  ];

  private router = inject(Router);

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}
