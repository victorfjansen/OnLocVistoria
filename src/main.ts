import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

async function startApiMocks(): Promise<void> {
  if (!environment.enableApiMocks) return;
  const { worker } = await import('./app/core/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

startApiMocks()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
