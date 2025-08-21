import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { LayoutOptions } from '../../services/layout/layout-options';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Auth } from '@core/services/auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  template: `
    <nav class="bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button
            pButton
            type="button"
            icon="pi pi-bars"
            [text]="true"
            class="p-button-rounded p-button-text"
            (click)="toggleSidebar()"
            aria-label="Toggle sidebar"
          ></button>
          
          <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0 hidden sm:block">
            Mobile Repair Manager
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <button
            pButton
            type="button"
            [icon]="layoutService.darkMode() ? 'pi pi-sun' : 'pi pi-moon'"
            [text]="true"
            class="p-button-rounded"
            (click)="toggleDarkMode()"
            aria-label="Toggle dark mode"
          ></button>

          <div class="relative">
            <p-avatar 
              [label]="getUserInitials()"
              styleClass="bg-primary text-primary-contrast cursor-pointer"
              shape="circle"
              (click)="userMenu.toggle($event)"
            ></p-avatar>
            
            <p-menu 
              #userMenu 
              [model]="userMenuItems" 
              [popup]="true"
              appendTo="body"
            ></p-menu>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class Navbar {
  protected readonly layoutService = inject(LayoutOptions);
  private readonly authService = inject(Auth);

  userMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => this.openProfile()
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.openSettings()
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
      styleClass: 'text-red-500'
    }
  ];

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleDarkMode(): void {
    this.layoutService.toggleDarkMode();
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  }

  logout(): void {
    this.authService.logout().subscribe({
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }

  private openProfile(): void {
    // TODO: Implementar navegación al perfil
  }

  private openSettings(): void {
    // TODO: Implementar navegación a configuración
  }
}
