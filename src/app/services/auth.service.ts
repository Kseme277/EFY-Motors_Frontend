import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  admin?: {
    id: number;
    email: string;
    nom?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'efy_admin_token';
  private adminKey = 'efy_admin_data';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Le backend attend email et password dans le body JSON
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.access_token) {
          this.setToken(response.access_token);
          if (response.admin) {
            this.setAdminData(response.admin);
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.removeAdminData();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/admin/login']).catch(() => {
      // Si la navigation échoue, rediriger vers la page d'accueil
      window.location.href = '/admin/login';
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getAdminData(): any {
    const data = localStorage.getItem(this.adminKey);
    return data ? JSON.parse(data) : null;
  }

  private setAdminData(admin: any): void {
    localStorage.setItem(this.adminKey, JSON.stringify(admin));
  }

  private removeAdminData(): void {
    localStorage.removeItem(this.adminKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

