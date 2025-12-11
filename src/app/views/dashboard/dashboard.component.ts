import { Component, inject, OnInit } from '@angular/core';
import {
  AvatarComponent,
  BadgeComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { WidgetsDropdownComponent } from '../widgets/widgets-dropdown/widgets-dropdown.component';
import { ApiService } from '../../services/api.service';

interface IRequest {
  id: number;
  nom: string;
  email: string;
  vehicle?: any;
  statut: string;
  created_at: string;
  status: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  imports: [WidgetsDropdownComponent, CardComponent, CardBodyComponent, RowComponent, ColComponent, IconDirective, CardHeaderComponent, TableDirective, AvatarComponent, BadgeComponent]
})
export class DashboardComponent implements OnInit {

  readonly #apiService: ApiService = inject(ApiService);

  // Statistiques du dashboard
  public stats = {
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0
  };

  public isLoading = false;
  public requests: IRequest[] = [];

  ngOnInit(): void {
    // Charger les données réelles
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Charger les statistiques des véhicules
    this.#apiService.getVehicles({ page: 1, size: 1 }).subscribe({
      next: (response: any) => {
        this.stats.totalVehicles = response.total || 0;
        
        // Charger les véhicules disponibles
        this.#apiService.getVehicles({ page: 1, size: 1, est_disponible: true }).subscribe({
          next: (availableResponse: any) => {
            this.stats.availableVehicles = availableResponse.total || 0;
            this.stats.soldVehicles = this.stats.totalVehicles - this.stats.availableVehicles;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
    
    // Charger les demandes
    this.#apiService.getDevisRequests({ page: 1, size: 10 }).subscribe({
      next: (response: any) => {
        this.stats.totalRequests = response.total || 0;
        this.requests = (response.items || []).slice(0, 6).map((req: any) => ({
          id: req.id,
          nom: req.nom,
          email: req.email,
          vehicle: req.vehicle,
          statut: req.statut,
          created_at: req.created_at,
          status: this.getStatusBadgeClass(req.statut),
          color: this.getStatusColor(req.statut)
        }));
        
        // Compter les demandes par statut
        const items = response.items || [];
        this.stats.pendingRequests = items.filter((r: any) => r.statut === 'pending').length;
        this.stats.acceptedRequests = items.filter((r: any) => r.statut === 'accepted').length;
        this.stats.rejectedRequests = items.filter((r: any) => r.statut === 'rejected').length;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'danger'
    };
    return classes[status] || 'secondary';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'accepted': 'success',
      'rejected': 'danger'
    };
    return colors[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'rejected': 'Rejetée'
    };
    return labels[status] || status;
  }

  getVehicleName(vehicle: any): string {
    if (!vehicle) return 'Véhicule inconnu';
    return `${vehicle.marque} ${vehicle.modele}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Il y a quelques secondes';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    return this.formatDate(dateString);
  }

  // Méthodes helper pour les calculs dans le template
  calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  getAvailableVehiclesPercentage(): number {
    return this.calculatePercentage(this.stats.availableVehicles, this.stats.totalVehicles);
  }

  getPendingRequestsPercentage(): number {
    return this.calculatePercentage(this.stats.pendingRequests, this.stats.totalRequests);
  }

  getAcceptedRequestsPercentage(): number {
    return this.calculatePercentage(this.stats.acceptedRequests, this.stats.totalRequests);
  }

  getTotalRequestsProgress(): number {
    if (this.stats.totalRequests === 0) return 0;
    // Limiter à 100% maximum
    const progress = (this.stats.totalRequests / 100) * 100;
    return Math.min(progress, 100);
  }

}

