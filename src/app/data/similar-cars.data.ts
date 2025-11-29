import { STATIC_CARS, StaticCar } from './cars.data';

/**
 * Mapping des voitures similaires
 * Clé: ID de la voiture
 * Valeur: Array d'IDs de voitures similaires
 */
export const SIMILAR_CARS_MAP: { [carId: number]: number[] } = {
  1: [2, 3, 5],      // Toyota RAV4 Hybride -> Hyundai Creta, Toyota Hilux, Mercedes GLC
  2: [1, 4, 7],      // Hyundai Creta -> Toyota RAV4, Kia Rio, Nissan X-Trail
  3: [1, 6, 9],      // Toyota Hilux -> Toyota RAV4, Toyota Prado, Ford Ranger
  4: [2, 7, 10],     // Kia Rio -> Hyundai Creta, Nissan X-Trail, Mazda CX-5
  5: [1, 6, 11],     // Mercedes GLC -> Toyota RAV4, Toyota Prado, Volkswagen Tiguan
  6: [3, 5, 9],      // Toyota Prado -> Toyota Hilux, Mercedes GLC, Ford Ranger
  7: [2, 4, 12],     // Nissan X-Trail -> Hyundai Creta, Kia Rio, Honda CR-V
  8: [10, 11, 12],   // Peugeot 3008 -> Mazda CX-5, Volkswagen Tiguan, Honda CR-V
  9: [3, 6, 8],      // Ford Ranger -> Toyota Hilux, Toyota Prado, Peugeot 3008
  10: [4, 7, 11],    // Mazda CX-5 -> Kia Rio, Nissan X-Trail, Volkswagen Tiguan
  11: [5, 8, 10],    // Volkswagen Tiguan -> Mercedes GLC, Peugeot 3008, Mazda CX-5
  12: [7, 8, 10]     // Honda CR-V -> Nissan X-Trail, Peugeot 3008, Mazda CX-5
};

/**
 * Récupère les voitures similaires pour une voiture donnée
 * @param carId - ID de la voiture
 * @param limit - Nombre maximum de voitures similaires à retourner (par défaut: 3)
 * @returns Array de voitures similaires
 */
export function getSimilarCars(carId: number, limit: number = 3): StaticCar[] {
  const similarIds = SIMILAR_CARS_MAP[carId] || [];
  
  // Si pas de mapping spécifique, utiliser la logique par défaut (même marque)
  if (similarIds.length === 0) {
    const currentCar = STATIC_CARS.find(c => c.id === carId);
    if (!currentCar) {
      return [];
    }
    
    return STATIC_CARS
      .filter(c => c.id !== carId && c.brand === currentCar.brand)
      .slice(0, limit);
  }
  
  // Retourner les voitures similaires selon le mapping
  return STATIC_CARS
    .filter(car => similarIds.includes(car.id))
    .slice(0, limit);
}

/**
 * Vérifie si deux voitures sont similaires
 */
export function areSimilarCars(carId1: number, carId2: number): boolean {
  const similarIds = SIMILAR_CARS_MAP[carId1] || [];
  return similarIds.includes(carId2);
}

