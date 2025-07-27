import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-consumo-dispositivo',
  templateUrl: './consumo-dispositivo.component.html'
})
export class ConsumoDispositivoComponent implements OnInit {
  @Input() dispositivoId!: number;

  lineChartData: ChartConfiguration<'line'>['data'] | null = null;
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.dispositivoId) return;

    this.http.get<any[]>(`https://localhost:7009/api/dispositivos/${this.dispositivoId}/consumo`)
      .subscribe(data => {
        const labels = data.map(d => new Date(d.fecha).toLocaleDateString());
        const values = data.map(d => d.consumoKwH);

        this.lineChartData = {
          labels,
          datasets: [
            {
              data: values,
              label: 'Consumo (kWh)',
              fill: true,
              tension: 0.3,
              borderColor: '#2f80ed',
              backgroundColor: 'rgba(47,128,237,0.3)'
            }
          ]
        };
      });
  }
}
