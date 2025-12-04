import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { STATIC_CARS } from '../../../data/cars.data';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalRevenue: 0
  };

  recentVehicles: any[] = [];
  recentOrders: any[] = [];

  ngOnInit() {
    this.loadStatistics();
    this.loadRecentVehicles();
    this.loadRecentOrders();
  }

  private loadStatistics() {
    const cars = STATIC_CARS;
    this.stats.totalVehicles = cars.length;
    this.stats.availableVehicles = cars.length;
    this.stats.soldVehicles = 0;
    this.stats.totalRevenue = cars.reduce((sum, car) => sum + car.price, 0);
  }

  private loadRecentVehicles() {
    this.recentVehicles = STATIC_CARS.slice(0, 5).map(car => ({
      id: car.id,
      name: car.name,
      brand: car.brand,
      price: car.price,
      image: car.image,
      status: 'Disponible'
    }));
  }

  private loadRecentOrders() {
    // Données de démonstration
    this.recentOrders = [
      { id: 1, customer: 'Jean Dupont', vehicle: 'Toyota RAV4', amount: 45000, date: '2024-03-15', status: 'En attente' },
      { id: 2, customer: 'Marie Martin', vehicle: 'Hyundai Creta', amount: 38000, date: '2024-03-14', status: 'Confirmée' },
      { id: 3, customer: 'Paul Kouam', vehicle: 'Toyota Hilux', amount: 52000, date: '2024-03-13', status: 'Livrée' }
    ];
  }
}

