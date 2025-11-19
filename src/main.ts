import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import AOS from 'aos';
import 'aos/dist/aos.css';

// 🚨 AJOUTS POUR LA LOCALE FRANÇAISE 🚨
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr'); // Enregistre les données pour la clé 'fr'

AOS.init();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));