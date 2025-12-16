import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

const mergedProviders = [
  ...(appConfig?.providers ?? []),
  provideHttpClient(withInterceptorsFromDi()),
]

bootstrapApplication(App, { ...appConfig, providers: mergedProviders })
  .catch((err) => console.error(err));
