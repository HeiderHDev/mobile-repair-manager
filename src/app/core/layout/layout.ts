import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';
import { LayoutOptions } from '../services/layout/layout-options';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Sidebar],
  template: `
    <div class="min-h-screen bg-surface-50 dark:bg-surface-950">
      <!-- Navbar -->
      <app-navbar></app-navbar>
      
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Main Content -->
      <main class="transition-all duration-300">
        <div class="container mx-auto px-4 py-6">
          <router-outlet></router-outlet>
        </div>
      </main>
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
export class Layout implements OnInit {
  private readonly layoutService = inject(LayoutOptions);

  ngOnInit(): void {
    this.layoutService.initializeTheme();
  }
}
