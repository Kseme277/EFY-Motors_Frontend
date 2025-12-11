import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Car {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
  mileage: number;
  transmission: string;
  seats: number;
  luggage: number;
  fuel: string;
  reviews?: any[];
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, FormsModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  allCars: Car[] = [];
  isLoading: boolean = true;

  cars: Car[] = [];
  displayedCars: Car[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  totalItems: number = 0;

  // Calcul du kilométrage maximum disponible
  maxAvailableMileage: number = 100000;

  // Filtres
  selectedBrands: string[] = [];
  maxMileage: number = this.maxAvailableMileage;
  selectedTransmissions: string[] = [];
  selectedSeats: number | null = null;
  selectedLuggage: number | null = null;
  selectedFuels: string[] = [];

  // Options disponibles
  brands: string[] = [];
  transmissions: string[] = ['Manuelle', 'Automatique'];
  seats: number[] = [2, 4, 5, 7];
  luggage: number[] = [1, 2, 3, 4];
  fuels: string[] = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'Hybride Rechargeable'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  private loadVehicles() {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      size: 100, // Charger plus de véhicules pour les filtres
      est_disponible: true
    };

    this.apiService.getVehicles(params).subscribe({
      next: (response) => {
        const vehicles = response.items || [];
        this.allCars = vehicles.map((vehicle: any) => ({
          id: vehicle.id,
          name: `${vehicle.marque} ${vehicle.modele}`,
          brand: vehicle.marque,
          image: vehicle.photo_principale || vehicle.photos?.[0] || 'assets/images/car-1.jpg',
          price: vehicle.prix,
          mileage: vehicle.kilometrage,
          transmission: vehicle.boite_vitesse,
          seats: vehicle.nombre_places || 5,
          luggage: vehicle.nombre_bagages || 0,
          fuel: vehicle.carburant,
          nombre_avis: vehicle.nombre_avis || 0,
          rating: vehicle.rating || 0
        }));

        // Initialiser les marques disponibles
        this.brands = [...new Set(this.allCars.map((c) => c.brand))].sort();

        // Calculer le kilométrage maximum
        const mileages = this.allCars.map((c) => c.mileage).filter((m) => m > 0);
        if (mileages.length > 0) {
          this.maxAvailableMileage = Math.max(...mileages);
          this.maxMileage = this.maxAvailableMileage;
        }

        this.totalItems = response.total || this.allCars.length;
        this.filterCars();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules:', error);
        this.allCars = [];
        this.cars = [];
        this.isLoading = false;
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.cars.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedCars = this.cars.slice(startIndex, endIndex);
  }

  private mapFuelType(fuel: string): string {
    const fuelMap: { [key: string]: string } = {
      'essence': 'Essence',
      'diesel': 'Diesel',
      'electrique': 'Électrique',
      'hybride': 'Hybride',
      'hybride_rechargeable': 'Hybride Rechargeable'
    };
    return fuelMap[fuel?.toLowerCase()] || fuel || 'Essence';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  private mapTransmission(transmission: string): string {
    const transMap: { [key: string]: string } = {
      'automatique': 'Automatique',
      'manuelle': 'Manuelle',
      'automatic': 'Automatique',
      'manual': 'Manuelle'
    };
    return transMap[transmission?.toLowerCase()] || transmission || 'Automatique';
  }

  filterCars() {
    this.cars = this.allCars.filter((car) => {
      const matchBrand =
        this.selectedBrands.length === 0 || this.selectedBrands.includes(car.brand);

      const matchMileage = car.mileage <= this.maxMileage;

      const matchTransmission =
        this.selectedTransmissions.length === 0 ||
        this.selectedTransmissions.includes(this.mapTransmission(car.transmission));

      const matchSeats =
        this.selectedSeats === null || car.seats === this.selectedSeats;

      const matchLuggage =
        this.selectedLuggage === null || car.luggage === this.selectedLuggage;

      const carFuelMapped = this.mapFuelType(car.fuel);
      const matchFuel =
        this.selectedFuels.length === 0 || this.selectedFuels.includes(carFuelMapped);

      return (
        matchBrand &&
        matchMileage &&
        matchTransmission &&
        matchSeats &&
        matchLuggage &&
        matchFuel
      );
    });
    this.currentPage = 1; // Reset à la première page après filtrage
    this.updatePagination();
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.filterCars();
  }

  toggleTransmission(transmission: string) {
    const index = this.selectedTransmissions.indexOf(transmission);
    if (index > -1) {
      this.selectedTransmissions.splice(index, 1);
    } else {
      this.selectedTransmissions.push(transmission);
    }
    this.filterCars();
  }

  toggleFuel(fuel: string) {
    const index = this.selectedFuels.indexOf(fuel);
    if (index > -1) {
      this.selectedFuels.splice(index, 1);
    } else {
      this.selectedFuels.push(fuel);
    }
    this.filterCars();
  }

  onMileageChange() {
    this.filterCars();
  }

  onSeatsChange() {
    this.filterCars();
  }

  onLuggageChange() {
    this.filterCars();
  }

  resetFilters() {
    this.selectedBrands = [];
    this.maxMileage = this.maxAvailableMileage;
    this.selectedTransmissions = [];
    this.selectedSeats = null;
    this.selectedLuggage = null;
    this.selectedFuels = [];
    this.filterCars();
  }
}
