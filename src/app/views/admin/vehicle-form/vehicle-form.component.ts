import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AlertComponent,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormFeedbackComponent,
    FormSelectDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    ButtonDirective,
    IconDirective,
    AlertComponent
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss'
})
export class AdminVehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  isEditMode: boolean = false;
  vehicleId: number | null = null;
  imagePreview: string | null = null;
  mainImageFile: File | null = null;
  additionalImagesFiles: File[] = [];
  additionalImagesPreviews: string[] = [];
  existingPhotos: string[] = [];
  isLoading = false;
  errorMessage = '';
  validated = false;

  fuelTypes = [
    { value: 'essence', label: 'Essence' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybride', label: 'Hybride' },
    { value: 'electrique', label: 'Électrique' },
    { value: 'hybride_rechargeable', label: 'Hybride Rechargeable' }
  ];
  transmissionTypes = ['Manuelle', 'Automatique'];

  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private http: HttpClient,
    private authService: AuthService,
    private swal: SweetAlertService
  ) {
    this.vehicleForm = this.fb.group({
      marque: ['', [Validators.required]],
      modele: ['', [Validators.required]],
      annee: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      prix: ['', [Validators.required, Validators.min(0)]],
      kilometrage: ['', [Validators.required, Validators.min(0)]],
      boite_vitesse: ['', [Validators.required]],
      nombre_places: ['', [Validators.required, Validators.min(2), Validators.max(9)]],
      nombre_bagages: ['', [Validators.required, Validators.min(0)]],
      carburant: ['', [Validators.required]],
      puissance: [''],
      couleur: [''],
      nombre_portes: [''],
      description: [''],
      est_disponible: [true],
      est_en_vedette: [false]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vehicleId = +id;
      this.loadVehicleData();
    }
  }

  private loadVehicleData() {
    if (!this.vehicleId) return;
    
    this.isLoading = true;
    this.apiService.getVehicle(this.vehicleId).subscribe({
      next: (vehicle) => {
        this.vehicleForm.patchValue({
          marque: vehicle.marque,
          modele: vehicle.modele,
          annee: vehicle.annee,
          prix: vehicle.prix,
          kilometrage: vehicle.kilometrage,
          boite_vitesse: vehicle.boite_vitesse,
          nombre_places: vehicle.nombre_places,
          nombre_bagages: vehicle.nombre_bagages,
          carburant: vehicle.carburant,
          puissance: vehicle.puissance || '',
          couleur: vehicle.couleur || '',
          nombre_portes: vehicle.nombre_portes || '',
          description: vehicle.description || '',
          est_disponible: vehicle.est_disponible,
          est_en_vedette: vehicle.est_en_vedette || false
        });
        this.imagePreview = vehicle.photo_principale || vehicle.photos?.[0] || null;
        this.existingPhotos = vehicle.photos || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du véhicule:', error);
        this.errorMessage = 'Erreur lors du chargement du véhicule';
        this.isLoading = false;
      }
    });
  }

  onMainImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mainImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onAdditionalImagesChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.additionalImagesFiles = files;
    
    this.additionalImagesPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.additionalImagesPreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeAdditionalImage(index: number) {
    this.additionalImagesFiles.splice(index, 1);
    this.additionalImagesPreviews.splice(index, 1);
  }

  removeExistingPhoto(index: number) {
    this.existingPhotos.splice(index, 1);
  }

  onSubmit() {
    this.validated = true;
    
    if (this.vehicleForm.invalid) {
      Object.keys(this.vehicleForm.controls).forEach(key => {
        this.vehicleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.vehicleForm.value;
    const vehicleData = {
      marque: formData.marque,
      modele: formData.modele,
      annee: parseInt(formData.annee),
      prix: parseFloat(formData.prix),
      kilometrage: parseInt(formData.kilometrage),
      boite_vitesse: formData.boite_vitesse,
      nombre_places: parseInt(formData.nombre_places),
      nombre_bagages: parseInt(formData.nombre_bagages),
      carburant: formData.carburant,
      puissance: formData.puissance ? parseInt(formData.puissance) : null,
      couleur: formData.couleur || null,
      nombre_portes: formData.nombre_portes ? parseInt(formData.nombre_portes) : null,
      description: formData.description || null,
      est_disponible: formData.est_disponible,
      est_en_vedette: formData.est_en_vedette || false,
      photos: this.existingPhotos,
      features: {},
      tags: []
    };

    if (this.isEditMode && this.vehicleId) {
      this.apiService.updateVehicle(this.vehicleId, vehicleData).subscribe({
        next: async (vehicle) => {
          try {
            if (this.mainImageFile) {
              await this.uploadMainImage(vehicle.id);
            }
            if (this.additionalImagesFiles.length > 0) {
              await this.uploadAdditionalImages(vehicle.id);
            }
            this.isLoading = false;
            this.swal.success('Succès', 'Véhicule modifié avec succès !').then(() => {
              this.router.navigate(['/admin/vehicles']);
            });
          } catch (error) {
            console.error('Erreur lors de l\'upload des images:', error);
            this.isLoading = false;
            this.errorMessage = 'Véhicule modifié mais erreur lors de l\'upload des images';
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.errorMessage = 'Erreur lors de la mise à jour du véhicule';
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.createVehicle(vehicleData).subscribe({
        next: async (vehicle) => {
          try {
            if (this.mainImageFile) {
              await this.uploadMainImage(vehicle.id);
            }
            if (this.additionalImagesFiles.length > 0) {
              await this.uploadAdditionalImages(vehicle.id);
            }
            this.isLoading = false;
            this.swal.success('Succès', 'Véhicule ajouté avec succès !').then(() => {
              this.router.navigate(['/admin/vehicles']);
            });
          } catch (error) {
            console.error('Erreur lors de l\'upload des images:', error);
            this.isLoading = false;
            this.errorMessage = 'Véhicule créé mais erreur lors de l\'upload des images';
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.errorMessage = 'Erreur lors de la création du véhicule';
          this.isLoading = false;
        }
      });
    }
  }

  private async uploadMainImage(vehicleId: number): Promise<void> {
    if (!this.mainImageFile) return;
    
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', this.mainImageFile!);
      
      const authHeaders = this.authService.getAuthHeaders();
      const headers = new HttpHeaders({
        'Authorization': authHeaders['Authorization'] || ''
      });
      
      this.http.post(
        `${this.apiUrl}/vehicules/${vehicleId}/upload-photo?is_main=true`,
        formData,
        { headers }
      ).subscribe({
        next: () => resolve(),
        error: (error) => {
          console.error('Erreur upload photo principale:', error);
          reject(error);
        }
      });
    });
  }

  private async uploadAdditionalImages(vehicleId: number): Promise<void> {
    if (this.additionalImagesFiles.length === 0) return;
    
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      this.additionalImagesFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const authHeaders = this.authService.getAuthHeaders();
      const headers = new HttpHeaders({
        'Authorization': authHeaders['Authorization'] || ''
      });
      
      this.http.post(
        `${this.apiUrl}/vehicules/${vehicleId}/upload-photos`,
        formData,
        { headers }
      ).subscribe({
        next: () => resolve(),
        error: (error) => {
          console.error('Erreur upload photos supplémentaires:', error);
          reject(error);
        }
      });
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field?.hasError('required') && field.touched) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('min') && field.touched) {
      return `La valeur minimale est ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max') && field.touched) {
      return `La valeur maximale est ${field.errors?.['max'].max}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.validated));
  }
}

