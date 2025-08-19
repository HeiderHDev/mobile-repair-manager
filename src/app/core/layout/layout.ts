import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>
      
      <!-- Main Content Area -->
      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar 
          [isOpen]="sidebarOpen"
          (closeSidebar)="closeSidebar()">
        </app-sidebar>
        
        <!-- Main Content -->
        <main class="flex-1 transition-all duration-300 ease-in-out"
              [class.ml-64]="sidebarOpen"
              [class.ml-0]="!sidebarOpen">
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class Layout {
  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
