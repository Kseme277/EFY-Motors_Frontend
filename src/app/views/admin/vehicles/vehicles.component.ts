import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertComponent,
  BadgeComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../services/api.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    IconDirective,
    FormControlDirective,
    FormSelectDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    AlertComponent,
    BadgeComponent
  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class AdminVehiclesComponent implements OnInit, AfterViewInit, AfterViewChecked {
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  isLoading = false;
  errorMessage = '';
  statusFilter: string = 'all';

  constructor(
    private apiService: ApiService,
    private swal: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadVehicles();
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
    const cardBody = document.querySelector('app-admin-vehicles c-card-body');
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

  private loadVehicles() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params: any = {
      page: this.currentPage,
      size: this.itemsPerPage
    };
    
    if (this.searchTerm.trim()) {
      params.marque = this.searchTerm.trim();
    }
    
    if (this.statusFilter === 'available') {
      params.est_disponible = true;
    } else if (this.statusFilter === 'sold') {
      params.est_disponible = false;
    }
    
    this.apiService.getVehicles(params).subscribe({
      next: (response) => {
        this.vehicles = (response.items || []).map((vehicle: any) => ({
          id: vehicle.id,
          name: `${vehicle.marque} ${vehicle.modele}`,
          brand: vehicle.marque,
          modele: vehicle.modele,
          price: vehicle.prix,
          image: vehicle.photo_principale || vehicle.photos?.[0] || 'assets/images/car-1.jpg',
          mileage: vehicle.kilometrage,
          transmission: vehicle.boite_vitesse,
          fuel: vehicle.carburant,
          status: vehicle.est_disponible ? 'Disponible' : 'Vendu',
          annee: vehicle.annee
        }));
        this.filteredVehicles = [...this.vehicles];
        this.totalItems = response.total || 0;
        this.totalPages = response.pages || 1;
        this.isLoading = false;
        setTimeout(() => this.setIconsToWhite(), 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.errorMessage = 'Erreur lors du chargement des véhicules';
        this.isLoading = false;
        this.vehicles = [];
        this.filteredVehicles = [];
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadVehicles();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadVehicles();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVehicles();
    }
  }

  deleteVehicle(id: number) {
    this.swal.confirm(
      'Supprimer le véhicule',
      'Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.',
      'Oui, supprimer',
      'Annuler'
    ).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.apiService.deleteVehicle(id).subscribe({
          next: () => {
            this.swal.success('Succès', 'Véhicule supprimé avec succès !');
            this.loadVehicles();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.swal.error('Erreur', 'Erreur lors de la suppression du véhicule');
            this.isLoading = false;
          }
        });
      }
    });
  }
}

