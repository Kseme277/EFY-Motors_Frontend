import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { SweetAlertService } from '../../services/sweet-alert.service';

interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  annee: number; // Added for template compatibility
  image: string;
  price: number;
  oldPrice?: number;
  mileage: number;
  transmission: string;
  seats: number;
  luggage: number;
  fuel: string;
  power: number; // ch / kW
  energy: string; // L/100km or kWh
  acceleration?: string; // 0-100 km/h
  photos: string[];
  photosCount: number;
  hasVideo: boolean;
  has360View: boolean; // Added
  isSold: boolean;
  isPromo: boolean;
  color: string;
  rating?: number;
  nombre_avis?: number;
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, FormsModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit, OnDestroy {
  @ViewChildren('scrollContainer') scrollContainers!: QueryList<ElementRef>;
  private autoScrollInterval: any;
  private currentImageIndices: { [key: number]: number } = {};
  allCars: Car[] = [];
  isLoading: boolean = true;
  showFilters: boolean = false;

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
  selectedConditions: string[] = [];
  selectedBrands: string[] = [];
  selectedModels: string[] = [];
  maxMileage: number = this.maxAvailableMileage;
  maxPower: number = 1000;
  maxPrice: number = 50000000;
  maxAcceleration: number = 20;
  selectedYear: string = '';
  selectedColors: string[] = [];
  selectedTransmissions: string[] = [];
  selectedSeats: number | null = null;
  selectedLuggage: number | null = null;
  selectedFuels: string[] = [];

  // Options disponibles
  brands: string[] = [];
  models: string[] = [];
  years: number[] = [];
  colors: string[] = [];
  transmissions: string[] = ['Manuelle', 'Automatique'];
  seats: number[] = [2, 4, 5, 7];
  luggage: number[] = [1, 2, 3, 4];
  fuels: string[] = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'Hybride Rechargeable'];

  // Expanded sections state
  expandedSections: { [key: string]: boolean } = {
    condition: true,
    make: true,
    model: true,
    power: true,
    mileage: false,
    year: false,
    transmission: false,
    color: false
  };

  // Tri et Affichage
  currentSort: string = 'date-desc';
  viewMode: 'grid' | 'list' = 'grid';

  toggleSection(section: string) {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private swal: SweetAlertService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['brand']) this.selectedBrands = [params['brand']];
      if (params['fuel']) this.selectedFuels = [this.mapFuelType(params['fuel'])];
      // On pourrait aussi ajouter la logique pour prix min/max, 
      // mais le composant actuel filtre en local après chargement.
      this.loadVehicles();
    });
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (this.displayedCars.length === 0 || !this.scrollContainers) return;

      this.displayedCars.forEach((car, index) => {
        if (car.photos && car.photos.length > 1) {
          const container = this.scrollContainers.toArray()[index];
          if (container) {
            const currentIndex = this.currentImageIndices[car.id] || 0;
            const nextIndex = (currentIndex + 1) % car.photos.length;
            this.currentImageIndices[car.id] = nextIndex;
            
            const element = container.nativeElement;
            const scrollAmount = element.clientWidth * nextIndex;
            
            element.scrollTo({
              left: scrollAmount,
              behavior: 'smooth'
            });
          }
        }
      });
    }, 2000);
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
        let vehicles: any[] = [];
        if (response && response.items) {
          vehicles = response.items;
        } else if (response && response.results) {
          vehicles = response.results;
        } else if (response && response.vehicules) {
          vehicles = response.vehicules;
        } else if (Array.isArray(response)) {
          vehicles = response;
        } else if (response && response.data) {
          vehicles = response.data;
        }
        
        console.log('CarsComponent - Vehicles extracted:', vehicles);
        this.allCars = vehicles.map((vehicle: any) => {
          const isElectric = vehicle.carburant === 'electrique' || vehicle.carburant === 'HYBRIDE_RECHARGEABLE';
          let energyLabel = 'N/A';
          if (vehicle.consommation_mixte) {
            energyLabel = isElectric ? `${vehicle.consommation_mixte} kWh` : `${vehicle.consommation_mixte} L/100km`;
          }

          return {
            id: vehicle.id,
            name: `${vehicle.marque} ${vehicle.annee} ${vehicle.modele}`,
            brand: vehicle.marque,
            model: vehicle.modele,
            year: vehicle.annee,
            annee: vehicle.annee,
            image: vehicle.photo_principale || (vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos[0] : 'assets/images/car-1.jpg'),
            price: vehicle.est_en_promotion && vehicle.prix_promotionnel ? vehicle.prix_promotionnel : vehicle.prix,
            oldPrice: vehicle.est_en_promotion ? vehicle.prix : undefined,
            mileage: vehicle.kilometrage,
            transmission: vehicle.boite_vitesse,
            seats: vehicle.nombre_places || 5,
            luggage: vehicle.nombre_bagages || 0,
            fuel: vehicle.carburant,
            power: vehicle.puissance_din || 0,
            energy: energyLabel,
            acceleration: vehicle.features?.acceleration || 'N/A',
            photos: vehicle.photos || (vehicle.photo_principale ? [vehicle.photo_principale] : []),
            photosCount: vehicle.photos ? vehicle.photos.length : (vehicle.photo_principale ? 1 : 0),
            hasVideo: !!vehicle.features?.video_url,
            has360View: !!vehicle.features?.has_360_view, // Added
            isSold: vehicle.est_vendu || !vehicle.est_disponible,
            isPromo: vehicle.est_en_promotion,
            color: vehicle.couleur_exterieure || 'N/A',
            nombre_avis: vehicle.nombre_avis || 0,
            rating: vehicle.rating || 0
          };
        });

        // Initialiser les options de filtre
        this.brands = [...new Set(this.allCars.map((c) => c.brand))].sort();
        this.years = [...new Set(this.allCars.map((c) => c.year))].sort((a, b) => b - a);
        this.colors = [...new Set(this.allCars.map((c) => c.color).filter(c => c && c !== 'N/A'))].sort();

        // Calculer les maximums
        const mileages = this.allCars.map((c) => c.mileage).filter((m) => m > 0);
        if (mileages.length > 0) {
          this.maxAvailableMileage = Math.max(...mileages);
          this.maxMileage = this.maxAvailableMileage;
        }
        
        const prices = this.allCars.map((c) => c.price).filter(p => p > 0);
        if (prices.length > 0) {
          this.maxPrice = Math.max(...prices);
        }

        const powers = this.allCars.map(c => c.power).filter(p => p > 0);
        if (powers.length > 0) {
          this.maxPower = Math.max(...powers);
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

  parseAcceleration(acc: string | undefined): number {
    if (!acc || acc === 'N/A') return 999;
    const parsed = parseFloat(acc);
    return isNaN(parsed) ? 999 : parsed;
  }

  filterCars() {
    this.isLoading = true;
    setTimeout(() => {
      this.cars = this.allCars.filter((car) => {
        const carCondition = car.mileage === 0 ? 'Neuf' : 'Occasion';
        const matchCondition = this.selectedConditions.length === 0 || this.selectedConditions.includes(carCondition);

        const matchBrand =
          this.selectedBrands.length === 0 || this.selectedBrands.includes(car.brand);
          
        const matchModel =
          this.selectedModels.length === 0 || this.selectedModels.includes(car.model);

        const maxM = Number(this.maxMileage);
        const matchMileage = isNaN(maxM) || car.mileage <= maxM;
        
        const maxPwr = Number(this.maxPower);
        const matchPower = isNaN(maxPwr) || car.power <= maxPwr;

        const maxPrc = Number(this.maxPrice);
        const matchPrice = isNaN(maxPrc) || car.price <= maxPrc;

        const maxAcc = Number(this.maxAcceleration);
        const carAcc = this.parseAcceleration(car.acceleration);
        // Inclure les véhicules sans accélération définie, ou s'ils respectent le max
        const matchAcceleration = carAcc === 999 ? true : carAcc <= maxAcc;

        const matchYear = !this.selectedYear || String(car.year) === String(this.selectedYear);

        const matchColor = this.selectedColors.length === 0 || this.selectedColors.includes(car.color);

        const matchTransmission =
          this.selectedTransmissions.length === 0 ||
          this.selectedTransmissions.includes(this.mapTransmission(car.transmission));

        const matchSeats =
          this.selectedSeats === null || 
          String(this.selectedSeats) === 'null' || 
          car.seats === Number(this.selectedSeats);

        const matchLuggage =
          this.selectedLuggage === null || 
          String(this.selectedLuggage) === 'null' || 
          car.luggage === Number(this.selectedLuggage);

        const carFuelMapped = this.mapFuelType(car.fuel);
        const matchFuel =
          this.selectedFuels.length === 0 || this.selectedFuels.includes(carFuelMapped);

        return (
          matchCondition &&
          matchBrand &&
          matchModel &&
          matchMileage &&
          matchPower &&
          matchPrice &&
          matchAcceleration &&
          matchYear &&
          matchColor &&
          matchTransmission &&
          matchSeats &&
          matchLuggage &&
          matchFuel
        );
      });
      this.currentPage = 1; // Reset à la première page après filtrage
      this.sortCars();
      this.isLoading = false;
    }, 400);
  }

  sortCars() {
    if (this.currentSort === 'price-asc') {
      this.cars.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-desc') {
      this.cars.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'date-desc') {
      this.cars.sort((a, b) => b.id - a.id);
    }
    this.updatePagination();
  }

  onSortChange() {
    this.isLoading = true;
    setTimeout(() => {
      this.sortCars();
      this.isLoading = false;
    }, 400);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  updateAvailableModels() {
    if (this.selectedBrands.length === 0) {
      this.models = [];
      this.selectedModels = [];
    } else {
      this.models = [...new Set(this.allCars.filter(c => this.selectedBrands.includes(c.brand)).map(c => c.model))].sort();
      this.selectedModels = this.selectedModels.filter(m => this.models.includes(m));
    }
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.updateAvailableModels();
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

  toggleCondition(condition: string) {
    const index = this.selectedConditions.indexOf(condition);
    if (index > -1) {
      this.selectedConditions.splice(index, 1);
    } else {
      this.selectedConditions.push(condition);
    }
    this.filterCars();
  }

  toggleModel(model: string) {
    const index = this.selectedModels.indexOf(model);
    if (index > -1) {
      this.selectedModels.splice(index, 1);
    } else {
      this.selectedModels.push(model);
    }
    this.filterCars();
  }

  onPowerChange() {
    this.filterCars();
  }

  onPriceChange() {
    this.filterCars();
  }

  onAccelerationChange() {
    this.filterCars();
  }

  onYearChange() {
    this.filterCars();
  }

  toggleColor(color: string) {
    const index = this.selectedColors.indexOf(color);
    if (index > -1) {
      this.selectedColors.splice(index, 1);
    } else {
      this.selectedColors.push(color);
    }
    this.filterCars();
  }

  getColorHex(color: string): string {
    const map: { [key: string]: string } = {
      'noir': '#000000',
      'blanc': '#ffffff',
      'gris': '#808080',
      'bleu': '#0000ff',
      'rouge': '#ff0000',
      'vert': '#008000',
      'jaune': '#ffff00',
      'orange': '#ffa500',
      'marron': '#a52a2a',
      'argent': '#c0c0c0',
      'beige': '#f5f5dc',
      'rose': '#ffc0cb',
      'violet': '#ee82ee'
    };
    return map[color.toLowerCase()] || '#ccc';
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
    this.selectedConditions = [];
    this.selectedBrands = [];
    this.selectedModels = [];
    this.maxMileage = this.maxAvailableMileage;
    this.maxPower = 1000;
    this.maxPrice = 50000000;
    this.maxAcceleration = 20;
    this.selectedYear = '';
    this.selectedColors = [];
    this.selectedTransmissions = [];
    this.selectedSeats = null;
    this.selectedLuggage = null;
    this.selectedFuels = [];
    this.updateAvailableModels();
    this.filterCars();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  getStarsArray(rating: number = 0): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarsArray(rating: number = 0): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  copyLink(carId: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const url = window.location.origin + '/cars/' + carId;
    navigator.clipboard.writeText(url).then(() => {
      // On utilise SweetAlert pour plus de fiabilité si toastr ne s'affiche pas
      this.swal.toast('Lien du véhicule copié !', 'success');
      
      // On garde aussi toastr au cas où
      this.toastr.success('Le lien du véhicule a été copié !', 'Succès', {
        progressBar: true,
        closeButton: true,
        positionClass: 'toast-bottom-right'
      });
    });
  }
}
