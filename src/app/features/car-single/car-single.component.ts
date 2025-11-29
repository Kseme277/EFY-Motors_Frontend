import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CarCardComponent, CarCard } from '../../shared/components/car-card/car-card.component';
import { STATIC_CARS, StaticCar, StaticReview } from '../../data/cars.data';
import { getSimilarCars } from '../../data/similar-cars.data';
import { Subscription } from 'rxjs';

interface CarFeature {
  name: string;
  available: boolean;
}

type Car = StaticCar;
type Review = StaticReview;

@Component({
  selector: 'app-car-single',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, CarCardComponent],
  templateUrl: './car-single.component.html',
  styleUrl: './car-single.component.scss'
})
export class CarSingleComponent implements OnInit, OnDestroy {
  car: Car | null = null;
  relatedCars: CarCard[] = [];
  reviews: Review[] = [];
  activeTab: string = 'features';
  isLoading: boolean = false;
  isLoadingRelated: boolean = false;
  private routeSubscription?: Subscription;
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  
  isActiveTab(tab: string): boolean {
    return this.activeTab === tab;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    // Écouter les changements de paramètres de route
    this.routeSubscription = this.route.params.subscribe(params => {
      const carId = params['id'];
      if (carId) {
        this.loadVehicle(parseInt(carId, 10));
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  private showLoader() {
    const loader = document.getElementById('ftco-loader');
    if (loader) {
      loader.classList.add('show');
      loader.classList.remove('hidden');
      loader.style.display = 'block';
      loader.style.visibility = 'visible';
      loader.style.opacity = '1';
    }
  }

  private hideLoader() {
    const loader = document.getElementById('ftco-loader');
    if (loader) {
      loader.classList.remove('show');
      loader.classList.add('hidden');
      loader.style.display = 'none';
      loader.style.visibility = 'hidden';
      loader.style.opacity = '0';
    }
  }

  private loadVehicle(id: number) {
    this.isLoading = true;
    this.car = null;
    this.relatedCars = [];
    this.reviews = [];
    this.showLoader();

    const found = STATIC_CARS.find((c) => c.id === id);
    if (!found) {
      this.router.navigate(['/cars']);
      this.hideLoader();
      this.isLoading = false;
      return;
    }

    // Mapper les features depuis les données statiques
    const featureNames: { [key: string]: string } = {
      'airconditions': 'Climatisation',
      'child_seat': 'Siège enfant',
      'gps': 'GPS',
      'luggage': 'Bagages',
      'music': 'Musique',
      'seat_belt': 'Ceinture de sécurité',
      'sleeping_bed': 'Lit de repos',
      'water': 'Eau',
      'bluetooth': 'Bluetooth',
      'onboard_computer': 'Ordinateur de bord',
      'audio_input': 'Entrée audio',
      'long_term_trips': 'Voyages longue distance',
      'car_kit': 'Kit voiture',
      'remote_central_locking': 'Verrouillage centralisé à distance',
      'climate_control': 'Contrôle climatique'
    };

    const features: CarFeature[] = found.features 
      ? Object.entries(found.features).map(([key, value]) => ({
          name: featureNames[key] || key,
          available: Boolean(value)
        }))
      : [];

    this.car = {
      ...found,
    };

    this.loadSimilarVehicles(id);
    this.loadReviews(id);

    this.isLoading = false;
    this.hideLoader();
  }

  private loadSimilarVehicles(vehicleId: number) {
    this.isLoadingRelated = true;
    
    // Utiliser le fichier de données pour les voitures similaires
    const related = getSimilarCars(vehicleId, 3);

    this.relatedCars = related.map((v) => ({
      id: v.id,
      name: v.name,
      image: v.image,
      tags: [v.brand],
      price: v.price,
      brand: v.brand,
      mileage: v.mileage,
      transmission: v.transmission,
      seats: v.seats,
      luggage: v.luggage,
      fuel: v.fuel,
    }));

    this.isLoadingRelated = false;
  }

  private loadReviews(vehicleId: number) {
    // Charger les avis statiques depuis les données
    const vehicle = STATIC_CARS.find(c => c.id === vehicleId);
    this.reviews = vehicle?.reviews || [];
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

  private mapFeatures(features: any): CarFeature[] {
    return [];
  }

  getTransmissionLabel(transmission: string): string {
    return transmission === 'Automatique' ? 'Automatique' : 'Manuelle';
  }

  getFuelLabel(fuel: string): string {
    const fuelMap: { [key: string]: string } = {
      'Essence': 'Essence',
      'Diesel': 'Diesel',
      'Hybride': 'Hybride',
      'Électrique': 'Électrique'
    };
    return fuelMap[fuel] || fuel;
  }

  getFeatureGroups(): CarFeature[][] {
    if (!this.car || !this.car.features) {
      return [];
    }
    
    // Convert features object to array
    const featureNames: { [key: string]: string } = {
      'airconditions': 'Climatisation',
      'child_seat': 'Siège enfant',
      'gps': 'GPS',
      'luggage': 'Bagages',
      'music': 'Musique',
      'seat_belt': 'Ceinture de sécurité',
      'sleeping_bed': 'Lit de repos',
      'water': 'Eau',
      'bluetooth': 'Bluetooth',
      'onboard_computer': 'Ordinateur de bord',
      'audio_input': 'Entrée audio',
      'long_term_trips': 'Voyages longue distance',
      'car_kit': 'Kit voiture',
      'remote_central_locking': 'Verrouillage centralisé à distance',
      'climate_control': 'Contrôle climatique'
    };

    const features: CarFeature[] = Object.entries(this.car.features).map(([key, value]) => ({
      name: featureNames[key] || key,
      available: Boolean(value)
    }));

    const chunkSize = Math.ceil(features.length / 3);
    const groups: CarFeature[][] = [];
    for (let i = 0; i < features.length; i += chunkSize) {
      groups.push(features.slice(i, i + chunkSize));
    }
    return groups;
  }
  
  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0).map((x, i) => i);
  }
  
  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0).map((x, i) => i);
  }
  
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
  
  getRoundedAverageRating(): number {
    return Math.round(this.getAverageRating());
  }
  
  getRatingCount(rating: number): number {
    return this.reviews.filter(r => r.rating === rating).length;
  }
  
  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return (count / this.reviews.length) * 100;
  }
}

