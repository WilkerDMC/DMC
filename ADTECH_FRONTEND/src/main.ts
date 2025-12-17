import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';

appConfig.providers = [
  ...(appConfig.providers || []),
  provideHttpClient ()
];

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
