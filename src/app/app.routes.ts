import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';


// NOTE : Nous supposons que l'Estimation sera une page/route accessible DEPUIS le Dashboard,
// ou qu'elle sera intégrée à celui-ci (ex: /dashboard/estimation).

export const routes: Routes = [
  // 1. Point d'entrée : redirige la racine vers la page de connexion
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 

  // 2. Pages d'Authentification
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'E.M.E.S - Connexion'
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    title: 'E.M.E.S - Inscription'
  },

  // 3. Espace Client (Dashboard) - Protégé par un Guard dans un projet réel
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    title: 'E.M.E.S - Tableau de Bord'
    // Ici, vous ajouteriez l'AuthGuard: canActivate: [AuthGuard]
  }
];