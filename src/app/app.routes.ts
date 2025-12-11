import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { CarsComponent } from './features/cars/cars.component';
import { CarSingleComponent } from './features/car-single/car-single.component';
import { ServicesComponent } from './features/services/services.component';
import { PricingComponent } from './features/pricing/pricing.component';
import { BlogComponent } from './features/blog/blog.component';
import { ContactComponent } from './features/contact/contact.component';
import { DefaultLayoutComponent } from './layout/default-layout/default-layout.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AdminVehiclesComponent } from './views/admin/vehicles/vehicles.component';
import { AdminVehicleFormComponent } from './views/admin/vehicle-form/vehicle-form.component';
import { AdminRequestsComponent } from './views/admin/requests/requests.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';
import { AuthGuard } from './guards/auth.guard';

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
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'vehicles',
        component: AdminVehiclesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'vehicles/add',
        component: AdminVehicleFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'vehicles/edit/:id',
        component: AdminVehicleFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'requests',
        component: AdminRequestsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'orders',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'settings',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
