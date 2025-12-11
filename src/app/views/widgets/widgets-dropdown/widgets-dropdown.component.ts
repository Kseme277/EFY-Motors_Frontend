import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, inject, input, OnInit, viewChild } from '@angular/core';
import { getStyle } from '@coreui/utils';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { RouterLink } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  ColComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  RowComponent,
  TemplateIdDirective,
  WidgetStatAComponent
} from '@coreui/angular';

@Component({
  selector: 'app-widgets-dropdown',
  standalone: true,
  templateUrl: './widgets-dropdown.component.html',
  imports: [RowComponent, ColComponent, WidgetStatAComponent, TemplateIdDirective, IconDirective, DropdownComponent, ButtonDirective, DropdownToggleDirective, DropdownMenuDirective, DropdownItemDirective, RouterLink, DropdownDividerDirective, ChartjsComponent]
})
export class WidgetsDropdownComponent implements OnInit, AfterContentInit {
  private changeDetectorRef = inject(ChangeDetectorRef);

  // Inputs pour les données réelles
  stats = input<{
    totalVehicles: number;
    availableVehicles: number;
    soldVehicles: number;
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
  }>({
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0
  });

  data: any[] = [];
  options: any[] = [];
  labels = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
    'Janvier',
    'Février',
    'Mars',
    'Avril'
  ];
  datasets = [
    [{
      label: 'Mon premier dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-primary'),
      pointHoverBorderColor: getStyle('--cui-primary'),
      data: [65, 59, 84, 84, 51, 55, 40]
    }], [{
      label: 'Mon deuxième dataset',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-info'),
      pointHoverBorderColor: getStyle('--cui-info'),
      data: [1, 18, 9, 17, 34, 22, 11]
    }], [{
      label: 'Mon troisième dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: getStyle('--cui-warning'),
      pointHoverBorderColor: getStyle('--cui-warning'),
      data: [78, 81, 80, 45, 34, 12, 40],
      fill: true
    }], [{
      label: 'Mon quatrième dataset',
      backgroundColor: 'rgba(255,255,255,.2)',
      borderColor: 'rgba(255,255,255,.55)',
      data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
      barPercentage: 0.7
    }]
  ];
  optionsDefault = {
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: {
          display: false
        },
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          display: false
        }
      },
      y: {
        min: 30,
        max: 89,
        display: false,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 1,
        tension: 0.4
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 4
      }
    }
  };

  ngOnInit(): void {
    this.setData();
  }

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();

  }

  setData() {
    for (let idx = 0; idx < 4; idx++) {
      this.data[idx] = {
        labels: idx < 3 ? this.labels.slice(0, 7) : this.labels,
        datasets: this.datasets[idx]
      };
    }
    this.setOptions();
  }

  setOptions() {
    for (let idx = 0; idx < 4; idx++) {
      const options = JSON.parse(JSON.stringify(this.optionsDefault));
      switch (idx) {
        case 0: {
          this.options.push(options);
          break;
        }
        case 1: {
          options.scales.y.min = -9;
          options.scales.y.max = 39;
          options.elements.line.tension = 0;
          this.options.push(options);
          break;
        }
        case 2: {
          options.scales.x = { display: false };
          options.scales.y = { display: false };
          options.elements.line.borderWidth = 2;
          options.elements.point.radius = 0;
          this.options.push(options);
          break;
        }
        case 3: {
          options.scales.x.grid = { display: false, drawTicks: false };
          options.scales.x.grid = { display: false, drawTicks: false, drawBorder: false };
          options.scales.y.min = undefined;
          options.scales.y.max = undefined;
          options.elements = {};
          this.options.push(options);
          break;
        }
      }
    }
  }

  getSoldVehiclesPercentage(): number {
    const statsValue = this.stats();
    if (statsValue.totalVehicles === 0) return 0;
    return Math.round((statsValue.soldVehicles / statsValue.totalVehicles) * 100);
  }
}

