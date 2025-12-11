import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../services/api.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';

interface VehicleRequest {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  vehicle_id: number;
  vehicle?: any;
  message?: string;
  statut: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    BadgeComponent,
    FormControlDirective,
    FormSelectDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ButtonCloseDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    AlertComponent
  ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss'
})
export class AdminRequestsComponent implements OnInit, AfterViewInit, AfterViewChecked {
  requests: VehicleRequest[] = [];
  filteredRequests: VehicleRequest[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  isLoading = false;
  errorMessage = '';
  selectedRequest: VehicleRequest | null = null;
  showMessageModal = false;

  statusLabels: { [key: string]: string } = {
    'pending': 'En attente',
    'accepted': 'Acceptée',
    'rejected': 'Rejetée'
  };

  constructor(
    private apiService: ApiService,
    private swal: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  ngAfterViewInit() {
    setTimeout(() => this.setIconsToWhite(), 0);
  }

  ngAfterViewChecked() {
    // Utiliser un flag pour éviter les appels répétés
    if (!this.isLoading) {
      setTimeout(() => this.setIconsToWhite(), 0);
    }
  }

  private setIconsToWhite() {
    // Cibler uniquement les icônes dans le card-body, pas dans le header
    const cardBody = document.querySelector('app-admin-requests c-card-body');
    if (cardBody) {
      const svgs = cardBody.querySelectorAll('svg[cIcon]');
      svgs.forEach((svg: any) => {
        svg.style.color = 'white';
        svg.style.fill = 'white';
        svg.setAttribute('style', 'color: white !important; fill: white !important;');
        const paths = svg.querySelectorAll('path, rect, circle, polygon, line');
        paths.forEach((path: any) => {
          path.setAttribute('fill', 'white');
          path.setAttribute('stroke', 'white');
          path.style.fill = 'white';
          path.style.stroke = 'white';
        });
      });
    }
  }

  private loadRequests() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };
    
    if (this.statusFilter !== 'all') {
      params.statut = this.statusFilter;
    }
    
    this.apiService.getDevisRequests(params).subscribe({
      next: (response) => {
        this.requests = (response.items || []).map((req: any) => ({
          id: req.id,
          nom: req.nom,
          email: req.email,
          telephone: req.telephone || '',
          vehicle_id: req.vehicle_id,
          vehicle: req.vehicle,
          message: req.message || '',
          statut: req.statut,
          created_at: req.created_at
        }));
        this.filteredRequests = [...this.requests];
        this.totalItems = response.total || 0;
        this.totalPages = response.pages || 1;
        this.isLoading = false;
        setTimeout(() => this.setIconsToWhite(), 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes:', error);
        this.errorMessage = 'Erreur lors du chargement des demandes';
        this.isLoading = false;
        this.requests = [];
        this.filteredRequests = [];
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadRequests();
  }

  private applyFilters() {
    let filtered = [...this.requests];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.nom.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term) ||
        (request.vehicle?.marque && request.vehicle.marque.toLowerCase().includes(term)) ||
        (request.vehicle?.modele && request.vehicle.modele.toLowerCase().includes(term)) ||
        (request.telephone && request.telephone.includes(term))
      );
    }

    this.filteredRequests = filtered;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  updateStatus(requestId: number, newStatus: 'pending' | 'accepted' | 'rejected') {
    this.isLoading = true;
    this.apiService.updateDevisRequest(requestId, { statut: newStatus }).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
        this.swal.error('Erreur', 'Erreur lors de la mise à jour du statut');
        this.isLoading = false;
      }
    });
  }

  deleteRequest(id: number) {
    this.swal.confirm(
      'Supprimer la demande',
      'Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.',
      'Oui, supprimer',
      'Annuler'
    ).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.apiService.deleteDevisRequest(id).subscribe({
          next: () => {
            this.swal.success('Succès', 'Demande supprimée avec succès !');
            this.loadRequests();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.swal.error('Erreur', 'Erreur lors de la suppression de la demande');
            this.isLoading = false;
          }
        });
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getVehicleName(vehicle: any): string {
    if (!vehicle) return 'Véhicule inconnu';
    return `${vehicle.marque} ${vehicle.modele}`;
  }

  viewMessage(request: VehicleRequest) {
    this.selectedRequest = request;
    this.showMessageModal = true;
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.selectedRequest = null;
  }
}

