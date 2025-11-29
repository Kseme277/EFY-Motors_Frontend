import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const API_URL = environment.apiUrl || 'http://localhost:8000/api';

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

  // Contact
  sendContactMessage(data: { name: string; email: string; subject: string; message: string }): Observable<any> {
    return this.http.post(`${API_URL}/contact`, data, { headers: this.headers });
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
    return this.http.get(`${API_URL}/vehicules`, { params: httpParams });
  }

  getFeaturedVehicles(limit: number = 6): Observable<any> {
    return this.http.get(`${API_URL}/vehicules/featured`, { params: { limit: limit.toString() } });
  }

  getVehicle(id: number): Observable<any> {
    return this.http.get(`${API_URL}/vehicules/${id}`);
  }

  getSimilarVehicles(vehicleId: number, limit: number = 3): Observable<any> {
    return this.http.get(`${API_URL}/vehicules/${vehicleId}/similar`, { 
      params: { limit: limit.toString() }
    });
  }

  // Reviews
  getVehicleReviews(vehicleId: number, page: number = 1, size: number = 20): Observable<any> {
    return this.http.get(`${API_URL}/vehicules/${vehicleId}/reviews`, { 
      params: { page: page.toString(), size: size.toString() }
    });
  }

  createReview(vehicleId: number, data: { name: string; rating: number; comment: string; avatar?: string }): Observable<any> {
    return this.http.post(`${API_URL}/vehicules/${vehicleId}/reviews`, data, { headers: this.headers });
  }

  // Devis
  createDevisRequest(data: { vehicle_id: number; nom: string; email: string; telephone?: string; message?: string }): Observable<any> {
    return this.http.post(`${API_URL}/devis`, data, { headers: this.headers });
  }

  // Admin routes (avec token) - Utilise maintenant AuthService

  // Admin - Vehicles
  createVehicle(data: any): Observable<any> {
    return this.http.post(`${API_URL}/vehicules`, data, { headers: this.headers });
  }

  updateVehicle(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/vehicules/${id}`, data, { headers: this.headers });
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/vehicules/${id}`, { headers: this.headers });
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
}

