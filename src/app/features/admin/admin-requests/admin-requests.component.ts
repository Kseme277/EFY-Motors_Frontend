import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface VehicleRequest {
  id: number | string;
  customerName: string;
  email: string;
  phone: string;
  vehicleId: number;
  vehicleName: string;
  vehicleBrand: string;
  message: string;
  date: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-requests.component.html',
  styleUrl: './admin-requests.component.scss'
})
export class AdminRequestsComponent implements OnInit {
  requests: VehicleRequest[] = [];
  filteredRequests: VehicleRequest[] = [];
  selectedRequest: VehicleRequest | null = null;
  expandedRows: Set<number> = new Set();
  
  searchTerm: string = '';
  statusFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  statusLabels: { [key: string]: string } = {
    'new': 'Nouvelle',
    'in-progress': 'En cours',
    'completed': 'Traitée',
    'cancelled': 'Annulée'
  };


  ngOnInit() {
    this.loadRequests();
  }

  private getDayOfYear(dateString: string): number {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private loadRequests() {
    // Données de démonstration
    const rawRequests = [
      {
        id: 1,
        customerName: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        phone: '+237 697 123 456',
        vehicleId: 1,
        vehicleName: 'Toyota RAV4 Hybride',
        vehicleBrand: 'Toyota',
        message: 'Bonjour, je souhaiterais avoir plus d\'informations sur ce véhicule. Est-il toujours disponible ?',
        date: '2024-03-15',
        status: 'new' as const,
        priority: 'high' as const
      },
      {
        id: 2,
        customerName: 'Marie Martin',
        email: 'marie.martin@email.com',
        phone: '+237 698 234 567',
        vehicleId: 2,
        vehicleName: 'Hyundai Creta',
        vehicleBrand: 'Hyundai',
        message: 'Je voudrais savoir si je peux faire un essai routier de ce véhicule.',
        date: '2024-03-14',
        status: 'in-progress' as const,
        priority: 'medium' as const
      },
      {
        id: 3,
        customerName: 'Paul Kouam',
        email: 'paul.kouam@email.com',
        phone: '+237 699 345 678',
        vehicleId: 3,
        vehicleName: 'Toyota Hilux Double Cabine',
        vehicleBrand: 'Toyota',
        message: 'Quel est le prix final avec toutes les options ? Y a-t-il une garantie ?',
        date: '2024-03-13',
        status: 'completed' as const,
        priority: 'high' as const
      },
      {
        id: 4,
        customerName: 'Sophie Ngo',
        email: 'sophie.ngo@email.com',
        phone: '+237 690 456 789',
        vehicleId: 1,
        vehicleName: 'Toyota RAV4 Hybride',
        vehicleBrand: 'Toyota',
        message: 'Intéressée par ce véhicule. Pouvez-vous me contacter rapidement ?',
        date: '2024-03-12',
        status: 'new' as const,
        priority: 'high' as const
      },
      {
        id: 5,
        customerName: 'Marc Tchouassi',
        email: 'marc.tchouassi@email.com',
        phone: '+237 691 567 890',
        vehicleId: 4,
        vehicleName: 'Nissan X-Trail',
        vehicleBrand: 'Nissan',
        message: 'Je cherche un véhicule similaire mais avec moins de kilométrage.',
        date: '2024-03-11',
        status: 'cancelled' as const,
        priority: 'low' as const
      }
    ];

    // Générer les IDs basés sur le jour de l'année et le numéro consécutif
    const dayCounts: { [key: number]: number } = {};
    
    this.requests = rawRequests.map((req) => {
      const dayOfYear = this.getDayOfYear(req.date);
      if (!dayCounts[dayOfYear]) {
        dayCounts[dayOfYear] = 0;
      }
      dayCounts[dayOfYear]++;
      const requestId = `${dayOfYear}-${dayCounts[dayOfYear]}`;
      return {
        ...req,
        id: requestId
      } as VehicleRequest & { id: string };
    }) as any;
    
    this.filteredRequests = [...this.requests];
    this.calculatePages();
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.requests];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.customerName.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term) ||
        request.vehicleName.toLowerCase().includes(term) ||
        request.phone.includes(term)
      );
    }

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === this.statusFilter);
    }

    this.filteredRequests = filtered;
    this.currentPage = 1;
    this.calculatePages();
  }

  calculatePages() {
    this.totalPages = Math.max(1, Math.ceil(this.filteredRequests.length / this.itemsPerPage));
  }

  get paginatedRequests() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRequests.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleRow(requestId: number | string) {
    if (this.expandedRows.has(requestId as number)) {
      this.expandedRows.delete(requestId as number);
    } else {
      this.expandedRows.add(requestId as number);
    }
  }

  isRowExpanded(requestId: number | string): boolean {
    return this.expandedRows.has(requestId as number);
  }

  viewRequest(request: VehicleRequest) {
    this.selectedRequest = request;
  }

  closeRequestDetail() {
    this.selectedRequest = null;
  }

  updateStatus(requestId: number | string, newStatus: VehicleRequest['status']) {
    const request = this.requests.find(r => r.id === requestId);
    if (request) {
      request.status = newStatus;
      this.applyFilters();
    }
  }

  deleteRequest(id: number | string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      this.requests = this.requests.filter(r => r.id !== id);
      this.applyFilters();
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'new': 'badge-new',
      'in-progress': 'badge-progress',
      'completed': 'badge-completed',
      'cancelled': 'badge-cancelled'
    };
    return classes[status] || 'badge-default';
  }


  get newRequestsCount(): number {
    return this.requests.filter(r => r.status === 'new').length;
  }

  get inProgressRequestsCount(): number {
    return this.requests.filter(r => r.status === 'in-progress').length;
  }
}

