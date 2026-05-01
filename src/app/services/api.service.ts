import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const API_URL = environment.apiUrl || 'https://api.efymotors.com/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private get headers(): HttpHeaders {
    const authHeaders = this.authService.getAuthHeaders();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...authHeaders
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Contact (endpoint public, pas besoin d'authentification)
  sendContactMessage(data: { name: string; email: string; subject: string; message: string }): Observable<any> {
    const publicHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${API_URL}/contact`, data, { headers: publicHeaders });
  }

  // Auth - Utilise AuthService maintenant

  // Vehicles
  getVehicles(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get(`${API_URL}/vehicles`, { params: httpParams });
  }

  getFeaturedVehicles(limit: number = 6): Observable<any> {
    return this.http.get(`${API_URL}/vehicles/featured`, { params: { limit: limit.toString() } });
  }

  getVehicle(id: number): Observable<any> {
    return this.http.get(`${API_URL}/vehicles/${id}`);
  }

  getSimilarVehicles(vehicleId: number, limit: number = 3): Observable<any> {
    return this.http.get(`${API_URL}/vehicles/${vehicleId}/similar`, { 
      params: { limit: limit.toString() }
    });
  }

  // Reviews
  getAllReviews(page: number = 1, size: number = 20, statut: string = 'approuve'): Observable<any> {
    return this.http.get(`${API_URL}/reviews`, { 
      params: { page: page.toString(), size: size.toString(), statut: statut }
    });
  }

  getVehicleReviews(vehicleId: number, page: number = 1, size: number = 20): Observable<any> {
    return this.http.get(`${API_URL}/vehicles/${vehicleId}/reviews`, { 
      params: { page: page.toString(), size: size.toString() }
    });
  }

  createReview(vehicleId: number, data: { nom_client: string; rating: number; comment: string; avatar_url?: string }): Observable<any> {
    return this.http.post(`${API_URL}/vehicles/${vehicleId}/reviews`, data);
  }

  // Devis
  createDevisRequest(data: { vehicle_id: number; nom: string; email: string; telephone?: string; message?: string }): Observable<any> {
    return this.http.post(`${API_URL}/devis`, data, { headers: this.headers });
  }

  // Admin routes (avec token) - Utilise maintenant AuthService

  // Admin - Vehicles
  createVehicle(data: any): Observable<any> {
    return this.http.post(`${API_URL}/vehicles`, data, { headers: this.headers });
  }

  updateVehicle(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/vehicles/${id}`, data, { headers: this.headers });
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/vehicles/${id}`, { headers: this.headers });
  }

  // Admin - Devis
  getDevisRequests(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get(`${API_URL}/devis`, { params: httpParams, headers: this.headers });
  }

  updateDevisRequest(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/devis/${id}`, data, { headers: this.headers });
  }

  deleteDevisRequest(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/devis/${id}`, { headers: this.headers });
  }

  // Admin - Reviews
  getReviews(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get(`${API_URL}/reviews`, { params: httpParams, headers: this.headers });
  }

  updateReview(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/reviews/${id}`, data, { headers: this.headers });
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/reviews/${id}`, { headers: this.headers });
  }

  // Admin - Statistics
  getVehicleStats(): Observable<any> {
    // Récupère les statistiques des véhicules
    return this.http.get(`${API_URL}/vehicles`, { 
      params: { page: '1', size: '1' },
      headers: this.headers 
    });
  }

  getAvailableVehiclesCount(): Observable<any> {
    return this.http.get(`${API_URL}/vehicles`, { 
      params: { page: '1', size: '1', est_disponible: 'true' },
      headers: this.headers 
    });
  }

  getSoldVehiclesCount(): Observable<any> {
    return this.http.get(`${API_URL}/vehicles`, { 
      params: { page: '1', size: '1', est_disponible: 'false' },
      headers: this.headers 
    });
  }

  // AI Chatbot & Advisor
  askChatbot(message: string): Observable<any> {
    return this.http.post(`${API_URL}/chat/ask`, { message }, { headers: this.headers });
  }

  getAdvisorRecommendations(params: { budget_max?: number; usage?: string; nb_places?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.budget_max) httpParams = httpParams.set('budget_max', params.budget_max.toString());
      if (params.usage) httpParams = httpParams.set('usage', params.usage);
      if (params.nb_places) httpParams = httpParams.set('nb_places', params.nb_places.toString());
    }
    return this.http.get(`${API_URL}/advisor/recommend`, { params: httpParams, headers: this.headers });
  }
}

