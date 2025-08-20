import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutOptions {
  private _sidebarVisible = signal(false);
  private _darkMode = signal(true);

  readonly sidebarVisible = this._sidebarVisible.asReadonly();
  readonly darkMode = this._darkMode.asReadonly();

  toggleSidebar(): void {
    this._sidebarVisible.update(visible => !visible);
  }

  closeSidebar(): void {
    this._sidebarVisible.set(false);
  }

  toggleDarkMode(): void {
    this._darkMode.update(dark => !dark);
    this.updateTheme();
  }

  private updateTheme(): void {
    const htmlElement = document.documentElement;
    if (this._darkMode()) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  initializeTheme(): void {
    this.updateTheme();
  }
}
