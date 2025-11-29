import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {
  cars = [
    { name: 'Mercedes Grand Sedan', image: 'assets/images/car-1.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' },
    { name: 'Range Rover', image: 'assets/images/car-2.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' },
    { name: 'Mercedes Grand Sedan', image: 'assets/images/car-3.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' },
    { name: 'Mercedes Grand Sedan', image: 'assets/images/car-4.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' },
    { name: 'Range Rover', image: 'assets/images/car-5.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' },
    { name: 'Mercedes Grand Sedan', image: 'assets/images/car-6.jpg', hourlyRate: '10.99', dailyRate: '60.99', monthlyRate: '995.99' }
  ];
}
