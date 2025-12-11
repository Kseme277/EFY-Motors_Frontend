import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CarCardComponent, CarCard } from '../../shared/components/car-card/car-card.component';
import { ApiService } from '../../services/api.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Subscription } from 'rxjs';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

interface CarFeature {
  name: string;
  available: boolean;
}

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
  description?: string;
  features?: any;
  photos?: string[];
  photo_principale?: string;
  annee?: number;
  puissance?: number;
  couleur?: string;
  nombre_portes?: number;
}

interface Review {
  id: number;
  nom_client: string;
  avatar_url?: string;
  rating: number;
  comment: string;
  date: string;
  statut?: string;
}

@Component({
  selector: 'app-car-single',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink, CarCardComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './car-single.component.html',
  styleUrl: './car-single.component.scss'
})
export class CarSingleComponent implements OnInit, OnDestroy, AfterViewInit {
  car: Car | null = null;
  relatedCars: CarCard[] = [];
  reviews: Review[] = [];
  activeTab: string = 'description';
  isLoading: boolean = false;
  isLoadingRelated: boolean = false;
  isLoadingDevis: boolean = false;
  isLoadingReview: boolean = false;
  devisForm!: FormGroup;
  reviewForm!: FormGroup;
  selectedRating: number = 0;
  hoveredRating: number = 0;
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
    private scrollAnimationService: ScrollAnimationService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private swal: SweetAlertService
  ) {
    this.devisForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]+$/)]],
      message: ['']
    });

    this.reviewForm = this.fb.group({
      nom_client: ['', [Validators.required, Validators.minLength(2)]],
      commentaire: ['', [Validators.required, Validators.minLength(10)]],
      note: [0, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }
  
  ngAfterViewInit() {
    // Initialiser les animations de scroll
    this.initializeScrollAnimations();
  }
  
  private initializeScrollAnimations() {
    setTimeout(() => {
      const elements = document.querySelectorAll('.present, .present-left, .present-right, .present-zoom, .present-delay-1, .present-delay-2, .present-delay-3, .present-delay-4, .present-delay-5');
      this.scrollAnimationService.observeElements(elements);
    }, 100);
  }

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

    this.apiService.getVehicle(id).subscribe({
      next: (vehicle: any) => {
        // Construire la liste des photos (photo principale en premier, puis les autres)
        const allPhotos: string[] = [];
        if (vehicle.photo_principale) {
          allPhotos.push(vehicle.photo_principale);
        }
        if (vehicle.photos && Array.isArray(vehicle.photos)) {
          vehicle.photos.forEach((photo: string) => {
            if (photo && photo !== vehicle.photo_principale) {
              allPhotos.push(photo);
            }
          });
        }
        
        this.car = {
          id: vehicle.id,
          name: `${vehicle.marque} ${vehicle.modele}`,
          brand: vehicle.marque,
          image: vehicle.photo_principale || vehicle.photos?.[0] || 'assets/images/car-1.jpg',
          photos: allPhotos.length > 0 ? allPhotos : (vehicle.photos || []),
          price: vehicle.prix,
          mileage: vehicle.kilometrage,
          transmission: vehicle.boite_vitesse,
          seats: vehicle.nombre_places || 5,
          luggage: vehicle.nombre_bagages || 0,
          fuel: vehicle.carburant,
          description: vehicle.description,
          features: vehicle.features || {},
          annee: vehicle.annee,
          puissance: vehicle.puissance,
          couleur: vehicle.couleur,
          nombre_portes: vehicle.nombre_portes
        };

        this.loadSimilarVehicles(id);
        this.loadReviews(id);

        this.isLoading = false;
        this.hideLoader();
        
        // Réinitialiser les animations de scroll après le chargement
        setTimeout(() => {
          this.initializeScrollAnimations();
        }, 200);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du véhicule:', error);
        this.router.navigate(['/cars']);
        this.hideLoader();
        this.isLoading = false;
      }
    });
  }

  private loadSimilarVehicles(vehicleId: number) {
    this.isLoadingRelated = true;
    
    this.apiService.getSimilarVehicles(vehicleId, 3).subscribe({
      next: (response) => {
        const vehicles = response.items || response || [];
        this.relatedCars = vehicles.map((v: any) => ({
          id: v.id,
          name: `${v.marque} ${v.modele}`,
          image: v.photo_principale || v.photos?.[0] || 'assets/images/car-1.jpg',
          tags: v.tags || [v.marque],
          price: v.prix,
          brand: v.marque,
          mileage: v.kilometrage,
          transmission: v.boite_vitesse,
          seats: v.nombre_places || 5,
          luggage: v.nombre_bagages || 0,
          fuel: v.carburant,
          nombre_avis: v.nombre_avis || 0,
          rating: v.rating || 0
        }));
        this.isLoadingRelated = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des véhicules similaires:', error);
        this.relatedCars = [];
        this.isLoadingRelated = false;
      }
    });
  }

  private loadReviews(vehicleId: number) {
    this.apiService.getVehicleReviews(vehicleId, 1, 20).subscribe({
      next: (response) => {
        const reviewsData = response.items || response || [];
        this.reviews = reviewsData
          .filter((r: any) => r.statut === 'approuve' || !r.statut) // Filtrer seulement les avis approuvés
          .map((r: any) => ({
            id: r.id,
            nom_client: r.nom_client || 'Client',
            avatar_url: r.avatar_url || 'assets/images/testimonial1.jpg',
            rating: r.rating || 5,
            comment: r.comment || '',
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            statut: r.statut
          }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des avis:', error);
        this.reviews = [];
      }
    });
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

  onSubmitDevis() {
    if (this.devisForm.invalid || !this.car) {
      this.markFormGroupTouched(this.devisForm);
      return;
    }

    this.isLoadingDevis = true;
    const formData = {
      vehicle_id: this.car.id,
      nom: this.devisForm.value.nom,
      email: this.devisForm.value.email,
      telephone: this.devisForm.value.telephone,
      message: this.devisForm.value.message || `Demande de devis pour ${this.car.name}`
    };

    this.apiService.createDevisRequest(formData).subscribe({
      next: (response) => {
        this.isLoadingDevis = false;
        this.swal.success('Demande envoyée', 'Votre demande de devis a été envoyée avec succès. Nous vous contacterons dans les plus brefs délais.');
        this.devisForm.reset();
      },
      error: (error) => {
        this.isLoadingDevis = false;
        console.error('Erreur lors de l\'envoi de la demande:', error);
        this.swal.error('Erreur', error.error?.detail || 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ note: rating });
  }

  onRatingHover(rating: number) {
    this.hoveredRating = rating;
  }

  onRatingLeave() {
    this.hoveredRating = 0;
  }

  onSubmitReview() {
    if (this.reviewForm.invalid || !this.car || this.selectedRating === 0) {
      this.markFormGroupTouched(this.reviewForm);
      if (this.selectedRating === 0) {
        this.swal.warning('Note requise', 'Veuillez sélectionner une note avant de soumettre votre avis.');
      }
      return;
    }

    this.isLoadingReview = true;
    const formData = {
      nom_client: this.reviewForm.value.nom_client,
      rating: this.selectedRating,
      comment: this.reviewForm.value.commentaire
    };

    this.apiService.createReview(this.car.id, formData).subscribe({
      next: (response) => {
        this.isLoadingReview = false;
        this.swal.success('Avis envoyé', 'Votre avis a été soumis avec succès. Il sera publié après modération.');
        this.reviewForm.reset();
        this.selectedRating = 0;
        this.hoveredRating = 0;
        // Recharger les avis
        this.loadReviews(this.car!.id);
      },
      error: (error) => {
        this.isLoadingReview = false;
        console.error('Erreur lors de l\'envoi de l\'avis:', error);
        this.swal.error('Erreur', error.error?.detail || 'Une erreur est survenue lors de l\'envoi de votre avis. Veuillez réessayer.');
      }
    });
  }
}

