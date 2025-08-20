import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  setItemSync<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error storing item:', error);
      throw error;
    }
  }

  getItemSync<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  removeItemSync(key: string): void {
    localStorage.removeItem(key);
  }

  clearSync(): void {
    localStorage.clear();
  }

  setItem<T>(key: string, value: T): Observable<void> {
    return from(
      new Promise<void>((resolve, reject) => {
        try {
          this.setItemSync(key, value);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
    );
  }

  getItem<T>(key: string): Observable<T | null> {
    return of(this.getItemSync<T>(key));
  }

  deleteItem(key: string): Observable<void> {
    return from(
      new Promise<void>((resolve) => {
        this.removeItemSync(key);
        resolve();
      })
    );
  }

  clear(): Observable<void> {
    return from(
      new Promise<void>((resolve) => {
        this.clearSync();
        resolve();
      })
    );
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  getKeys(): string[] {
    return Object.keys(localStorage);
  }

  size(): number {
    return localStorage.length;
  }

  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  onStorageChange(): Observable<StorageEvent> {
    return new Observable(observer => {
      const handler = (event: StorageEvent) => {
        observer.next(event);
      };

      window.addEventListener('storage', handler);

      return () => {
        window.removeEventListener('storage', handler);
      };
    });
  }
}