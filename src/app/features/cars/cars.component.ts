import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { STATIC_CARS, StaticCar } from '../../data/cars.data';

type Car = StaticCar;

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, FormsModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  allCars: Car[] = [];
  isLoading: boolean = false;

  cars: Car[] = [];
  displayedCars: Car[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

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
  fuels: string[] = ['Essence', 'Diesel', 'Hybride', 'Électrique'];

  constructor() {}

  ngOnInit() {
    // Init statique: copier les véhicules depuis STATIC_CARS
    this.allCars = [...STATIC_CARS];

    // Initialiser les marques disponibles
    this.brands = [...new Set(this.allCars.map((c) => c.brand))].sort();

    // Calculer le kilométrage maximum
    const mileages = this.allCars.map((c) => c.mileage).filter((m) => m > 0);
    if (mileages.length > 0) {
      this.maxAvailableMileage = Math.max(...mileages);
      this.maxMileage = this.maxAvailableMileage;
    }

    this.cars = [...this.allCars];
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.cars.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedCars = this.cars.slice(startIndex, endIndex);
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

      const matchFuel =
        this.selectedFuels.length === 0 || this.selectedFuels.includes(this.mapFuelType(car.fuel));

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
