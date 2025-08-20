import { ChangeDetectorRef, Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from './core/services/loading/loading';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Spinner } from './shared/components/spinner/spinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Spinner, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('MobileRepairManager');
  private readonly _loadingService = inject(Loading);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public loading = signal(false);

  public ngOnInit(): void {
    this.listenToLoading();
  }

  private listenToLoading(): void {
    this._loadingService
      .isLoading()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading) => {
        this.loading.set(loading);
        this.cdr.detectChanges();
      });
  }
}
