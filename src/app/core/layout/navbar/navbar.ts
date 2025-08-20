import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { LayoutOptions } from '../../services/layout-options';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule],
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
          ></button>

          <p-avatar 
            label="U" 
            styleClass="bg-primary text-primary-contrast"
            shape="circle"
          ></p-avatar>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class Navbar {
  protected readonly layoutService = inject(LayoutOptions);

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleDarkMode(): void {
    this.layoutService.toggleDarkMode();
  }
}
