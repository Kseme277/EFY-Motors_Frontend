import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-vehicle-form.component.html',
  styleUrl: './admin-vehicle-form.component.scss'
})
export class AdminVehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  isEditMode: boolean = false;
  vehicleId: number | null = null;
  imagePreview: string | null = null;

  fuelTypes = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
  transmissionTypes = ['Manuelle', 'Automatique'];
  statusTypes = ['Disponible', 'Vendu', 'Réservé'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.vehicleForm = this.fb.group({
      name: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      mileage: ['', [Validators.required, Validators.min(0)]],
      transmission: ['', [Validators.required]],
      seats: ['', [Validators.required, Validators.min(1)]],
      luggage: ['', [Validators.required, Validators.min(0)]],
      fuel: ['', [Validators.required]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: ['Disponible', [Validators.required]]
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
    // Simuler le chargement des données du véhicule
    // En production, vous chargeriez depuis un service
    this.vehicleForm.patchValue({
      name: 'Toyota RAV4 Hybride',
      brand: 'Toyota',
      price: 45000,
      mileage: 15000,
      transmission: 'Automatique',
      seats: 5,
      luggage: 4,
      fuel: 'Hybride',
      image: 'assets/images/car-1.jpg',
      description: 'SUV compact hybride idéal pour la ville et les longs trajets.',
      status: 'Disponible'
    });
    this.imagePreview = 'assets/images/car-1.jpg';
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.vehicleForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const formData = this.vehicleForm.value;
      console.log('Données du véhicule:', formData);
      
      // Ici, vous enverriez les données à votre API
      // Pour l'instant, on simule juste la sauvegarde
      
      alert(this.isEditMode ? 'Véhicule modifié avec succès !' : 'Véhicule ajouté avec succès !');
      this.router.navigate(['/admin/vehicles']);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.vehicleForm.controls).forEach(key => {
        this.vehicleForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field?.hasError('required') && field.touched) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('min') && field.touched) {
      return `La valeur minimale est ${field.errors?.['min'].min}`;
    }
    return '';
  }
}

