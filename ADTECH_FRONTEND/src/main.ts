import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';


const mergedProviders = [
  ...(appConfig?.providers ?? []),
  provideHttpClient(withInterceptorsFromDi()),
  MatDialogModule,

  RouterModule,
  FormsModule,
]

bootstrapApplication(App, { ...appConfig, providers: mergedProviders })
  .catch((err) => console.error(err));
