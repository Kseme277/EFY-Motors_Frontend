export interface StaticCar {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  mileage: number;
  transmission: string;
  seats: number;
  luggage: number;
  fuel: string;
  description?: string;
  features?: { [key: string]: boolean };
  reviews?: StaticReview[];
}

export interface StaticReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

// Données statiques pour EFY Motors
export const STATIC_CARS: StaticCar[] = [
  {
    id: 1,
    name: 'Toyota RAV4 Hybride',
    brand: 'Toyota',
    price: 45000,
    image: 'assets/images/car-1.jpg',
    mileage: 15000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 4,
    fuel: 'Hybride',
    description: 'SUV compact hybride idéal pour la ville et les longs trajets. Économique et respectueux de l\'environnement.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      luggage: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      onboard_computer: true
    },
    reviews: [
      {
        id: 1,
        name: 'Jean Dupont',
        rating: 5,
        comment: 'Excellent véhicule, très économique et confortable. Parfait pour la famille.',
        date: '15 Mars 2024',
        avatar: 'assets/images/person_1.jpg'
      },
      {
        id: 2,
        name: 'Marie Martin',
        rating: 4,
        comment: 'Très satisfaite de mon achat. La consommation est vraiment faible.',
        date: '10 Février 2024',
        avatar: 'assets/images/person_2.jpg'
      }
    ]
  },
  {
    id: 2,
    name: 'Hyundai Creta',
    brand: 'Hyundai',
    price: 38000,
    image: 'assets/images/car-2.jpg',
    mileage: 22000,
    transmission: 'Manuelle',
    seats: 5,
    luggage: 3,
    fuel: 'Essence',
    description: 'SUV polyvalent avec faible consommation, parfait pour les routes du Cameroun.',
    features: {
      airconditions: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true
    },
    reviews: [
      {
        id: 3,
        name: 'Paul Kouam',
        rating: 5,
        comment: 'Véhicule robuste et adapté aux routes camerounaises. Bon rapport qualité-prix.',
        date: '5 Avril 2024',
        avatar: 'assets/images/person_3.jpg'
      }
    ]
  },
  {
    id: 3,
    name: 'Toyota Hilux Double Cabine',
    brand: 'Toyota',
    price: 52000,
    image: 'assets/images/car-3.jpg',
    mileage: 30000,
    transmission: 'Manuelle',
    seats: 5,
    luggage: 5,
    fuel: 'Diesel',
    description: 'Pick-up robuste pour le travail et les aventures hors route.',
    features: {
      airconditions: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      long_term_trips: true
    },
    reviews: [
      {
        id: 4,
        name: 'André Nkeng',
        rating: 5,
        comment: 'Véhicule très solide, parfait pour le transport et les terrains difficiles.',
        date: '20 Mars 2024',
        avatar: 'assets/images/person_4.jpg'
      }
    ]
  },
  {
    id: 4,
    name: 'Kia Rio Sedan',
    brand: 'Kia',
    price: 26000,
    image: 'assets/images/car-4.jpg',
    mileage: 12000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 3,
    fuel: 'Essence',
    description: 'Berline économique et confortable pour les déplacements quotidiens.',
    features: {
      airconditions: true,
      music: true,
      seat_belt: true,
      bluetooth: true
    },
    reviews: [
      {
        id: 5,
        name: 'Sophie Tchoupa',
        rating: 4,
        comment: 'Voiture pratique et économique. Idéale pour la ville.',
        date: '12 Janvier 2024',
        avatar: 'assets/images/person_1.jpg'
      }
    ]
  },
  {
    id: 5,
    name: 'Mercedes-Benz GLC',
    brand: 'Mercedes',
    price: 78000,
    image: 'assets/images/car-5.jpg',
    mileage: 18000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 4,
    fuel: 'Diesel',
    description: 'SUV premium alliant confort, luxe et performances.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      luggage: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      onboard_computer: true,
      climate_control: true,
      remote_central_locking: true
    },
    reviews: [
      {
        id: 6,
        name: 'David Mbarga',
        rating: 5,
        comment: 'Véhicule de luxe exceptionnel. Confort et performances au rendez-vous.',
        date: '8 Février 2024',
        avatar: 'assets/images/person_2.jpg'
      }
    ]
  },
  {
    id: 6,
    name: 'Toyota Prado',
    brand: 'Toyota',
    price: 95000,
    image: 'assets/images/car-6.jpg',
    mileage: 40000,
    transmission: 'Automatique',
    seats: 7,
    luggage: 5,
    fuel: 'Diesel',
    description: '4x4 haut de gamme pour les longs trajets et les terrains difficiles.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      luggage: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      onboard_computer: true,
      long_term_trips: true,
      climate_control: true
    },
    reviews: [
      {
        id: 7,
        name: 'François Ndi',
        rating: 5,
        comment: 'Le meilleur 4x4 que j\'ai jamais possédé. Très fiable et confortable.',
        date: '25 Janvier 2024',
        avatar: 'assets/images/person_3.jpg'
      }
    ]
  },
  {
    id: 7,
    name: 'Nissan X-Trail',
    brand: 'Nissan',
    price: 42000,
    image: 'assets/images/car-7.jpg',
    mileage: 25000,
    transmission: 'Automatique',
    seats: 7,
    luggage: 4,
    fuel: 'Essence',
    description: 'SUV spacieux et polyvalent, idéal pour les grandes familles.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      luggage: true,
      music: true,
      seat_belt: true,
      bluetooth: true
    },
    reviews: []
  },
  {
    id: 8,
    name: 'Peugeot 3008',
    brand: 'Peugeot',
    price: 35000,
    image: 'assets/images/car-8.jpg',
    mileage: 20000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 3,
    fuel: 'Diesel',
    description: 'SUV compact avec un design moderne et une conduite agréable.',
    features: {
      airconditions: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      onboard_computer: true
    },
    reviews: []
  },
  {
    id: 9,
    name: 'Ford Ranger',
    brand: 'Ford',
    price: 48000,
    image: 'assets/images/car-9.jpg',
    mileage: 35000,
    transmission: 'Manuelle',
    seats: 5,
    luggage: 5,
    fuel: 'Diesel',
    description: 'Pick-up puissant et fiable, parfait pour le travail et les loisirs.',
    features: {
      airconditions: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      long_term_trips: true
    },
    reviews: []
  },
  {
    id: 10,
    name: 'Mazda CX-5',
    brand: 'Mazda',
    price: 40000,
    image: 'assets/images/car-10.jpg',
    mileage: 18000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 4,
    fuel: 'Essence',
    description: 'SUV élégant avec une excellente tenue de route et un design soigné.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      onboard_computer: true
    },
    reviews: []
  },
  {
    id: 11,
    name: 'Volkswagen Tiguan',
    brand: 'Volkswagen',
    price: 44000,
    image: 'assets/images/car-11.jpg',
    mileage: 22000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 4,
    fuel: 'Diesel',
    description: 'SUV allemand réputé pour sa qualité et sa robustesse.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      music: true,
      seat_belt: true,
      bluetooth: true,
      climate_control: true
    },
    reviews: []
  },
  {
    id: 12,
    name: 'Honda CR-V',
    brand: 'Honda',
    price: 41000,
    image: 'assets/images/car-12.jpg',
    mileage: 16000,
    transmission: 'Automatique',
    seats: 5,
    luggage: 4,
    fuel: 'Essence',
    description: 'SUV fiable et économique, avec un excellent espace de chargement.',
    features: {
      airconditions: true,
      child_seat: true,
      gps: true,
      luggage: true,
      music: true,
      seat_belt: true,
      bluetooth: true
    },
    reviews: []
  }
];
