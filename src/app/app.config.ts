import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

// Gestionnaire d'erreurs personnalisé pour déboguer
class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Erreur Angular:', error);
    console.error('Stack trace:', error.stack);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withDebugTracing() // Activer le débogage du router
    ),
    { provide: ErrorHandler, useClass: CustomErrorHandler }
  ]
};
