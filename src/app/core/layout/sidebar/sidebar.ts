import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LayoutOptions } from '../../services/layout/layout-options';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from '@shared/interfaces/menu/menu-item.interface';
import { MenuUtils } from '@shared/Utils/menu.utils';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule, 
    DrawerModule, 
    RippleModule,
    TooltipModule
  ],
  templateUrl: './sidebar.html',
  styles: [`
    :host ::ng-deep .p-drawer-content {
      padding: 0;
    }

    :host ::ng-deep .p-drawer-header {
      background: var(--surface-0);
      border-bottom: 1px solid var(--surface-200);
      padding: 1.25rem;
    }

    :host-context(.dark) ::ng-deep .p-drawer-header {
      background: var(--surface-900);
      border-bottom-color: var(--surface-700);
    }

    :host ::ng-deep .p-ripple-effect {
      background: rgba(var(--primary-500-rgb), 0.2);
    }

    :host ::ng-deep .router-link-active {
      background: var(--primary-500) !important;
      color: white !important;
      box-shadow: 0 2px 8px rgba(var(--primary-500-rgb), 0.3);
    }

    :host ::ng-deep .router-link-active .group-hover\\:bg-primary-100,
    :host ::ng-deep .router-link-active .group-hover\\:text-primary-600 {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
    }

    :host ::ng-deep .router-link-active i {
      color: white !important;
    }
  `]
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
      {
        ...MenuUtils.createMenuItem('clients', 'Clientes', 'pi pi-users', '/clients'),
        badge: '12',
        badgeStyleClass: 'info'
      },
      {
        ...MenuUtils.createMenuItem('users', 'Usuarios', 'pi pi-user-plus', '/users')
      }
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

  protected getBadgeClasses(styleClass?: string): string {
    const baseClasses = 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200';
    
    const badgeStyles = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      warning: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      danger: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
    };

    return styleClass && badgeStyles[styleClass as keyof typeof badgeStyles] 
      ? badgeStyles[styleClass as keyof typeof badgeStyles] 
      : baseClasses;
  }
}