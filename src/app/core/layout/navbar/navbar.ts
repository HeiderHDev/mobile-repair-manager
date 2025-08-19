import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToolbarModule, AvatarModule, MenuModule],
  template: `
    <p-toolbar class="border-b border-gray-200 shadow-sm">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center space-x-4">
          <p-button 
            icon="pi pi-bars"
            [text]="true"
            severity="secondary"
            (click)="onToggleSidebar()"
            class="lg:hidden">
          </p-button>
          
          <div class="flex items-center space-x-2">
            <i class="pi pi-mobile text-2xl text-primary"></i>
            <span class="text-xl font-semibold text-gray-800">Mobile Repair Manager</span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <p-button 
            icon="pi pi-bell"
            [text]="true"
            severity="secondary"
            [badge]="'3'"
            badgeClass="p-badge-danger">
          </p-button>

          <div class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
               (click)="menu.toggle($event)">
            <p-avatar 
              icon="pi pi-user"
              styleClass="bg-primary text-white"
              shape="circle">
            </p-avatar>
            <div class="hidden md:block">
              <div class="text-sm font-medium text-gray-900">Usuario</div>
              <div class="text-xs text-gray-500">Administrador</div>
            </div>
            <i class="pi pi-chevron-down text-xs text-gray-500"></i>
          </div>
        </div>
      </div>
    </p-toolbar>

    <p-menu #menu [model]="userMenuItems" [popup]="true"></p-menu>
  `,
  styles: [`
    :host ::ng-deep .p-toolbar {
      background: white;
      border: none;
      padding: 0.75rem 1.5rem;
    }

    :host ::ng-deep .p-button.p-button-text {
      color: #6b7280;
    }

    :host ::ng-deep .p-button.p-button-text:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    :host ::ng-deep .p-avatar {
      width: 2.5rem;
      height: 2.5rem;
    }
  `]
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.navigateToProfile()
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.navigateToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  private navigateToProfile(): void {
    console.log('Navigate to profile');
  }

  private navigateToSettings(): void {
    console.log('Navigate to settings');
  }

  private logout(): void {
    console.log('Logout');
  }
}
