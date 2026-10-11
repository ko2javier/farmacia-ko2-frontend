import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Event coalescing now lives in provideZoneChangeDetection() in AppModule.
// The old ngZoneEventCoalescing option here did not stop Angular 21 from
// bootstrapping zoneless, which is what left the tables empty.
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
