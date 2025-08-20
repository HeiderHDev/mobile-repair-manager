import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LayoutOptions } from '../../services/layout/layout-options';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from '@shared/interfaces/menu/menu-item.interface';
import { MenuUtils } from '@shared/Utils/menu.utils';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, PanelMenuModule, DrawerModule, RippleModule],
  template: `
    <p-drawer
      [(visible)]="sidebarVisible"
      position="left"
      [modal]="true"
      styleClass="w-80"
      [showCloseIcon]="false"
    >
      <ng-template pTemplate="header">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i class="pi pi-mobile text-white text-sm"></i>
            </div>
            <span class="font-semibold text-surface-900 dark:text-surface-0">
              Repair Manager
            </span>
          </div>
          <button
            aria-label="Cerrar menú"
            pButton
            type="button"
            icon="pi pi-times"
            [text]="true"
            class="p-button-rounded p-button-sm"
            (click)="closeSidebar()"
          ></button>
        </div>
      </ng-template>

      <ng-template pTemplate="content">
        <div class="flex flex-col h-full">
          <!-- Menu Items -->
          <nav class="flex-1 py-4">
            <ul class="space-y-2">
              @for (item of visibleMenuItems; track item.id) {
                <li>
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="bg-primary-50 dark:bg-primary-900 text-primary border-r-2 border-primary"
                    class="flex items-center gap-3 px-4 py-3 text-surface-700 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg mx-2 transition-colors duration-200"
                    (click)="onMenuItemClick(item)"
                    pRipple
                  >
                    <i [class]="item.icon" class="text-lg"></i>
                    <span class="font-medium">{{ item.label }}</span>
                    @if (item.badge) {
                      <span 
                        [class]="'ml-auto px-2 py-1 text-xs rounded-full ' + (item.badgeStyleClass || 'bg-primary text-primary-contrast')"
                      >
                        {{ item.badge }}
                      </span>
                    }
                  </a>
                </li>
              }
            </ul>
          </nav>

          <!-- Footer -->
          <div class="border-t border-surface-200 dark:border-surface-700 pt-4 px-2">
            <div class="text-center text-sm text-surface-500 dark:text-surface-400">
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </ng-template>
    </p-drawer>
  `,
  styles: []
})
export class Sidebar implements OnInit {
  private readonly layoutService = inject(LayoutOptions);
  private readonly router = inject(Router);

  protected sidebarVisible = false;
  protected menuItems: MenuItem[] = [];
  protected visibleMenuItems: MenuItem[] = [];

  constructor() {
    effect(() => {
      this.sidebarVisible = this.layoutService.sidebarVisible();
    });
  }

  ngOnInit(): void {
    this.initializeMenu();
  }

  private initializeMenu(): void {
    this.menuItems = [
      MenuUtils.createMenuItem('dashboard', 'Dashboard', 'pi pi-home', '/dashboard'),
      MenuUtils.createMenuItem('users', 'Usuarios', 'pi pi-users', '/users'),
      MenuUtils.createMenuItem('clients', 'Clientes', 'pi pi-user', '/clients'),
      MenuUtils.createMenuItem('repairs', 'Reparaciones', 'pi pi-wrench', '/repairs', { 
        badge: '5', 
        badgeStyleClass: 'bg-orange-500 text-white' 
      }),
      MenuUtils.createMenuItem('inventory', 'Inventario', 'pi pi-box', '/inventory')
    ];
    
    this.visibleMenuItems = MenuUtils.filterVisibleItems(this.menuItems);
  }

  protected onMenuItemClick(item: MenuItem): void {
    if (item.command) {
      item.command();
    }
    this.closeSidebar();
  }

  protected closeSidebar(): void {
    this.layoutService.closeSidebar();
  }
}
