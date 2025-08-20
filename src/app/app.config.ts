import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading/loading-interceptor';
import { authInterceptor } from './core/interceptors/auth/auth-interceptor';
import { FORM_ERRORS, FORM_ERRORS_MESSAGES } from '@core/constants/form-errors-messages';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GlobalErrorHandler } from '@core/services/global-error-handler/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor, authInterceptor])),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkMode: true
            }
        }
    }),
    MessageService,
    ConfirmationService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {provide: FORM_ERRORS, useValue: FORM_ERRORS_MESSAGES}
  ]
};
