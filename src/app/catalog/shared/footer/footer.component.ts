import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  // Liens pour le Footer du Catalogue (Public)
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