import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; 

import { authGuard } from './guards/auth.guard'; // 👈 Import de la garde

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    
    // Route Sécurisée
    { 
      path: 'dashboard', 
      component: DashboardComponent,
      // Utilisation de la garde pour forcer la connexion
      canActivate: [authGuard] 
    },
    
    // { path: '**', redirectTo: 'login' } // Optionnel : Redirection des routes inconnues
];