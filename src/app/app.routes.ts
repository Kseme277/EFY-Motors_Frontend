import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { CarsComponent } from './features/cars/cars.component';
import { CarSingleComponent } from './features/car-single/car-single.component';
import { ServicesComponent } from './features/services/services.component';
import { PricingComponent } from './features/pricing/pricing.component';
import { BlogComponent } from './features/blog/blog.component';
import { ContactComponent } from './features/contact/contact.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminVehiclesComponent } from './features/admin/admin-vehicles/admin-vehicles.component';
import { AdminVehicleFormComponent } from './features/admin/admin-vehicle-form/admin-vehicle-form.component';
import { AdminRequestsComponent } from './features/admin/admin-requests/admin-requests.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'cars',
    component: CarsComponent
  },
  {
    path: 'cars/:id',
    component: CarSingleComponent
  },
  {
    path: 'services',
    component: ServicesComponent
  },
  {
    path: 'pricing',
    component: PricingComponent
  },
  {
    path: 'blog',
    component: BlogComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'vehicles',
        component: AdminVehiclesComponent
      },
      {
        path: 'vehicles/add',
        component: AdminVehicleFormComponent
      },
      {
        path: 'vehicles/edit/:id',
        component: AdminVehicleFormComponent
      },
      {
        path: 'requests',
        component: AdminRequestsComponent
      },
      {
        path: 'orders',
        component: AdminDashboardComponent // Placeholder
      },
      {
        path: 'users',
        component: AdminDashboardComponent // Placeholder
      },
      {
        path: 'settings',
        component: AdminDashboardComponent // Placeholder
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
