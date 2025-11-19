import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Le signal est la source unique de vérité pour l'état de la sidebar
  isSidebarOpen = signal(true); 

  constructor() { }

  /** Inverse l'état de la sidebar (appelé par la Navbar). */
  toggleSidebar(): void {
    this.isSidebarOpen.update(current => !current);
  }
}