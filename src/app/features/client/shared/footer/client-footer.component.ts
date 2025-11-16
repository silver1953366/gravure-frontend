import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  // ATTENTION: Si vous utilisez <app-client-footer> dans le dashboard, 
  // vous devez changer ce sélecteur à 'app-client-footer'.
  // J'ai laissé 'app-footer' ici et c'est le HTML du Dashboard qu'il faut corriger.
  selector: 'app-client-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-footer.component.html',
  styleUrls: ['./client-footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  // Liens pour le Footer du Client (simulé)
  companyLinks = [
    { label: 'À propos de nous', path: '/about' },
    { label: 'Nous contacter', path: '/contact' },
    { label: 'FAQ', path: '/faq' }
  ];

  legalLinks = [
    { label: 'Conditions Générales', path: '/terms' },
    { label: 'Politique de Confidentialité', path: '/privacy' },
    { label: 'Mentions Légales', path: '/legal' }
  ];
}