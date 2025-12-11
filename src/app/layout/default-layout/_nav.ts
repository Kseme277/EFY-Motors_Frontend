import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/admin/dashboard',
    iconComponent: { name: 'cilSpeedometer' }
  },
  {
    title: true,
    name: 'Gestion'
  },
  {
    name: 'Véhicules',
    url: '/admin/vehicles',
    iconComponent: { name: 'cilList' }
  },
  {
    name: 'Demandes',
    url: '/admin/requests',
    iconComponent: { name: 'cilEnvelopeOpen' }
  }
];

