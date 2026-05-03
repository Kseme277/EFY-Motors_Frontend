import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CarCardComponent, CarCard } from '../../shared/components/car-card/car-card.component';
import { ApiService } from '../../services/api.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { Subscription } from 'rxjs';
import { ScrollAnimationService } from '../../core/services/scroll-animation.service';

declare var $: any;

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
  consommation_mixte?: number;
  emissions_co2?: number;
  categorie?: string;
  vin?: string;
  drive_type?: string;
  garantie_mois?: number;
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
  imports: [CommonModule, HeaderComponent, FooterComponent, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './car-single.component.html',
  styleUrl: './car-single.component.scss'
})
export class CarSingleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private autoScrollInterval: any;
  private currentImageIndex: number = 0;
  private carCarouselInstance: any;
  car: Car | null = null;
  relatedCars: CarCard[] = [];
  reviews: Review[] = [];
  activeTab: string = 'review';
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
    private swal: SweetAlertService,
    private titleService: Title,
    private metaService: Meta
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
    // Initialiser le carousel s'il y a déjà des données
    if (this.relatedCars.length > 0) {
      setTimeout(() => this.initializeCarCarousel(), 500);
    }
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
      console.log('Route params changed:', params);
      const carId = params['id'];
      if (carId) {
        this.loadVehicle(parseInt(carId, 10));
      } else {
        console.warn('No car ID in route params');
      }
    });
    this.startAutoScroll();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
    this.destroyCarousel();
  }

  private destroyCarousel() {
    if (typeof $ !== 'undefined' && $('.carousel-car').length && $('.carousel-car').hasClass('owl-loaded')) {
      try {
        $('.carousel-car').owlCarousel('destroy');
      } catch (e) {}
      this.carCarouselInstance = null;
    }
  }

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      if (!this.car || !this.car.photos || this.car.photos.length <= 1 || !this.scrollContainer) return;

      this.currentImageIndex = (this.currentImageIndex + 1) % this.car.photos.length;
      
      const element = this.scrollContainer.nativeElement;
      const scrollAmount = element.clientWidth * this.currentImageIndex;
      
      element.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }, 5000);
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
        console.log('Vehicle data received from API:', vehicle);
        if (!vehicle) {
          console.error('API returned null/undefined for vehicle ID:', id);
          this.isLoading = false;
          this.hideLoader();
          return;
        }
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
          puissance: vehicle.puissance_din || vehicle.puissance,
          couleur: vehicle.couleur_exterieure || vehicle.couleur,
          nombre_portes: vehicle.nombre_portes,
          consommation_mixte: vehicle.consommation_mixte,
          emissions_co2: vehicle.emissions_co2,
          categorie: vehicle.categorie,
          vin: vehicle.vin,
          drive_type: vehicle.transmission, // traction, propulsion, 4x4
          garantie_mois: vehicle.garantie_mois
        };

        this.loadSimilarVehicles(id);
        this.loadReviews(id);
        this.updateSEO();

        this.isLoading = false;
        this.hideLoader();
        
        // Réinitialiser les animations de scroll après le chargement
        setTimeout(() => {
          this.initializeScrollAnimations();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading vehicle details:', error);
        this.isLoading = false;
        this.hideLoader();
        this.swal.error('Erreur', 'Impossible de charger les détails du véhicule.');
        this.router.navigate(['/cars']);
      }
    });
  }

  private updateSEO() {
    if (!this.car) return;
    const title = `${this.car.brand} ${this.car.name} | EFY Motors Cameroun`;
    const description = `Découvrez cette ${this.car.brand} ${this.car.name} d'exception chez EFY Motors. Prix: ${this.car.price} FCFA. Qualité certifiée et disponible dès maintenant.`;
    
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: this.car.image });
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
        
        // Initialiser le carousel après le chargement des données
        setTimeout(() => {
          this.initializeCarCarousel();
        }, 500);
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

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  private initializeCarCarousel(retryCount: number = 0) {
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      if (retryCount < 10) {
        setTimeout(() => this.initializeCarCarousel(retryCount + 1), 300);
      }
      return;
    }

    const $carCarousel = $('.carousel-car');
    if ($carCarousel.length === 0 || $carCarousel.children('.item').length === 0) {
      if (retryCount < 10 && this.relatedCars.length > 0) {
        setTimeout(() => this.initializeCarCarousel(retryCount + 1), 300);
      }
      return;
    }

    try {
      if ($carCarousel.hasClass('owl-loaded')) {
        $carCarousel.owlCarousel('destroy');
        $carCarousel.removeClass('owl-loaded owl-drag');
        $carCarousel.find('.owl-stage-outer').children().unwrap();
      }
      
      $carCarousel.removeData('owl.carousel');
      
      this.carCarouselInstance = $carCarousel.owlCarousel({
        items: 3,
        loop: this.relatedCars.length > 3,
        margin: 20,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        nav: false,
        dots: true,
        smartSpeed: 800,
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          1200: { items: 3 }
        }
      });
    } catch (e) {
      console.error('Error initializing car carousel:', e);
    }
  }
}

