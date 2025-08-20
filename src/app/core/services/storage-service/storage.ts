import { inject, Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  
  private readonly storage = inject(StorageMap);

  public setItem<T>(key: string, value: T): Observable<undefined> {
    return this.storage.set(key, value);
  }

  public deleteItem(key: string): Observable<undefined> {
    return this.storage.delete(key);
  }

  public clear(): Observable<undefined> {
    return this.storage.clear();
  }

  public getItem<T>(key: string): Observable<T> {
    return this.storage.get(key) as Observable<T>;
  }
}