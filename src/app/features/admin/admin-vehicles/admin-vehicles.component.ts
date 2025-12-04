import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STATIC_CARS } from '../../../data/cars.data';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-vehicles.component.html',
  styleUrl: './admin-vehicles.component.scss'
})
export class AdminVehiclesComponent implements OnInit {
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Modal et formulaire
  showModal: boolean = false;
  vehicleForm: FormGroup;
  imagePreview: string | null = null;
  
  fuelTypes = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
  transmissionTypes = ['Manuelle', 'Automatique'];
  statusTypes = ['Disponible', 'Vendu', 'Réservé'];

  constructor(private fb: FormBuilder) {
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
    this.loadVehicles();
  }

  private loadVehicles() {
    this.vehicles = STATIC_CARS.map(car => ({
      id: car.id,
      name: car.name,
      brand: car.brand,
      price: car.price,
      image: car.image,
      mileage: car.mileage,
      transmission: car.transmission,
      fuel: car.fuel,
      status: 'Disponible'
    }));
    this.filteredVehicles = [...this.vehicles];
    this.calculatePages();
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredVehicles = [...this.vehicles];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredVehicles = this.vehicles.filter(vehicle =>
        vehicle.name.toLowerCase().includes(term) ||
        vehicle.brand.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.calculatePages();
  }

  calculatePages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredVehicles.length / this.itemsPerPage));
  }

  get paginatedVehicles() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredVehicles.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteVehicle(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      this.vehicles = this.vehicles.filter(v => v.id !== id);
      this.onSearch();
    }
  }

  // Modal et formulaire
  openAddModal() {
    this.showModal = true;
    this.vehicleForm.reset({
      status: 'Disponible'
    });
    this.imagePreview = null;
  }

  closeModal() {
    this.showModal = false;
    this.vehicleForm.reset({
      status: 'Disponible'
    });
    this.imagePreview = null;
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

  onSubmitVehicle() {
    if (this.vehicleForm.valid) {
      const formData = this.vehicleForm.value;
      const newVehicle = {
        id: this.vehicles.length > 0 ? Math.max(...this.vehicles.map(v => v.id)) + 1 : 1,
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        image: formData.image,
        mileage: formData.mileage,
        transmission: formData.transmission,
        fuel: formData.fuel,
        status: formData.status
      };
      
      this.vehicles.push(newVehicle);
      this.onSearch();
      this.closeModal();
      alert('Véhicule ajouté avec succès !');
    } else {
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

