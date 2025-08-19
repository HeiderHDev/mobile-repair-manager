import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Loading {
  public isLoading$ = new BehaviorSubject<boolean>(false);
  private currentRequests = 0;

  public show(): void {
    this.isLoading$.next(true);
    this.currentRequests++;
  }

  public hide(): void {
    if (this.currentRequests) {
      this.currentRequests--;
    }
    if (!this.currentRequests) {
      this.isLoading$.next(false);
    }
  }

  public isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }
}
