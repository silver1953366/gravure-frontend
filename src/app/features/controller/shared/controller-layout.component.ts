// src/app/features/controller/shared/controller-layout/controller-layout.component.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ControllerSidebarComponent } from './controller-sidebar.component';
import { ControllerNavbarComponent } from './controller-navbar.component';

@Component({
  selector: 'app-controller-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ControllerSidebarComponent, ControllerNavbarComponent],
  template: `
    <div class="controller-layout-wrapper">
      <app-controller-sidebar></app-controller-sidebar>
      <div class="main-content">
        <app-controller-navbar></app-controller-navbar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./controller-layout.component.css']
})
export class ControllerLayoutComponent {}