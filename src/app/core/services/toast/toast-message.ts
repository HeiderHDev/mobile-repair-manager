import { inject, Injectable } from '@angular/core';
import { NgxToastService } from '@angular-magic/ngx-toast';
@Injectable({
  providedIn: 'root'
})
export class ToastMessage {
  private _ngxToastService = inject(NgxToastService);

  public success(title: string, message: string): void {
    this._ngxToastService.success({
      title,
      messages: [message],
      delay: 8000,
    });
  }

  public error(title: string, message: string): void {
    this._ngxToastService.error({
      title,
      messages: [message],
      delay: 8000,
    });
  }

  public warning(title: string, message: string): void {
    this._ngxToastService.warning({
      title,
      messages: [message],
      delay: 8000,
    });
  }

  public info(title: string, message: string): void {
    this._ngxToastService.info({
      title,
      messages: [message],
      delay: 8000,
    });
  }
}
