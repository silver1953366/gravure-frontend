import { Component, output, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// 🛑 ASSUREZ-VOUS QUE CES CHEMINS D'IMPORTATION SONT CORRECTS
import { NavbarComponent } from '../../../catalog/shared/navbar/navbar.component';
import { FooterComponent } from '../../../catalog/shared/footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar (openLoginModal)="openLoginModalEvent.emit()"></app-navbar> 
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
    // 🚀 Événement qui sera émis vers le parent (AppComponent)
    openLoginModalEvent = output<void>();
}