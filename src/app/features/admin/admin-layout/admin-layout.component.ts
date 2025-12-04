import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  isMobileMenuOpen = false;
  currentRoute: string = '';
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updatePageTitle();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updatePageTitle() {
    const url = this.router.url;
    this.currentRoute = url;
  }

  getPageTitle(): string {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) {
      return 'Dashboard';
    } else if (url.includes('/vehicles/edit')) {
      return 'Modifier un véhicule';
    } else if (url.includes('/vehicles')) {
      return 'Gestion des véhicules';
    } else if (url.includes('/requests')) {
      return 'Gestion des demandes';
    }
    
    return 'Dashboard Admin';
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }
}

