import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface CarCard {
  id: number;
  name: string;
  image: string;
  tags?: string[];
  price?: number;
  brand?: string;
  mileage?: number;
  transmission?: string;
  seats?: number;
  luggage?: number;
  fuel?: string;
  nombre_avis?: number;
  rating?: number;
}

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.scss'
})
export class CarCardComponent {
  @Input() car!: CarCard;
  @Input() showPrice: boolean = true;
  @Input() showDetails: boolean = true;

  getStarsArray(rating: number): number[] {
    const roundedRating = Math.round(rating);
    return Array(roundedRating).fill(0).map((x, i) => i);
  }

  getEmptyStars(rating: number): number[] {
    const roundedRating = Math.round(rating);
    return Array(5 - roundedRating).fill(0).map((x, i) => i);
  }
}

