import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 

// CHEMINS CORRIGÉS : Utilisation de './shared/...' au lieu de '../../../shared/...'
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

// Le dashboard est dans features/client
import { DashboardComponent } from './features/client/dashboard/dashboard.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NavbarComponent, 
    SidebarComponent, 
    FooterComponent,
    DashboardComponent 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Application Espace Client';
}