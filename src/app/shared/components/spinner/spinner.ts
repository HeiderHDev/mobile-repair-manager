import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[10000]">
        <div class="bg-white p-6 rounded-lg shadow-lg flex justify-center items-center">
          <p-progressSpinner 
            styleClass="w-12 h-12"
            strokeWidth="4"
            animationDuration="1s">
          </p-progressSpinner>
        </div>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .p-progress-spinner-circle {
      stroke: #3b82f6;
    }
    
    :host ::ng-deep .p-progress-spinner {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class Spinner {
  public loading = input<boolean>(false);
}
