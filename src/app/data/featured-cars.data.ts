import { STATIC_CARS, StaticCar } from './cars.data';

/**
 * IDs des voitures en vedette
 * Ces voitures seront affichées sur la page d'accueil
 */
export const FEATURED_CAR_IDS: number[] = [1, 2, 3, 4, 5, 6];

/**
 * Récupère les voitures en vedette depuis STATIC_CARS
 */
export function getFeaturedCars(): StaticCar[] {
  return STATIC_CARS.filter(car => FEATURED_CAR_IDS.includes(car.id));
}

/**
 * Vérifie si une voiture est en vedette
 */
export function isFeaturedCar(carId: number): boolean {
  return FEATURED_CAR_IDS.includes(carId);
}

