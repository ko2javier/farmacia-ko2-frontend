import { Component, OnInit } from '@angular/core';

import { VentasCanceladasService } from '../../services/ventas-canceladas.service';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { VentasUserService } from '../../services/ventas-user.service';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-estadisticas',
  standalone: true, // 👈 IMPORTANTE EN ANGULAR 19
  imports: [CommonModule, NgxChartsModule, TranslatePipe], // 👈 AQUÍ IMPORTAMOS LOS MÓDULOS
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {

  // --- DATOS PARA LOS GRÁFICOS ---
  ventasPorVendedor: any[] = [];
  cancelacionesPorResponsable: any[] = [];
  posicionLeyenda: LegendPosition = LegendPosition.Below;

  // --- CONFIGURACIÓN VISUAL ---
  view: [number, number] = [500, 300];

  // Esquema de Colores (Barras Verdes/Azules para ventas)
  colorSchemeVentas: Color = {
    name: 'ventasScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // Esquema de Colores (Rojos/Naranjas para cancelaciones)
  colorSchemeCancelaciones: Color = {
    name: 'cancelacionesScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#D9534F', '#FF7F50', '#B22222', '#8B0000']
  };

  constructor(
    private ventaService: VentasUserService,
    private canceladasService: VentasCanceladasService,private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarDatosVentas();
    this.cargarDatosCancelaciones();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }
  // 1. CARGAR Y AGRUPAR VENTAS
  cargarDatosVentas() {
    this.ventaService.cargarVentas() .subscribe(data => {
      // Magia: Agrupar por 'username' y sumar 'importe'
      const agrupado = data.reduce((acc: any, curr: any) => {
        const key = curr.username || 'Desconocido';
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += curr.importe;
        return acc;
      }, {});

      // Convertir al formato que pide el gráfico
      this.ventasPorVendedor = Object.keys(agrupado).map(key => ({
        name: key,
        value: agrupado[key]
      }));
    });
  }

  // 2. CARGAR Y AGRUPAR CANCELACIONES
  cargarDatosCancelaciones() {
    this.canceladasService.getCancelaciones().subscribe(data => {
      const agrupado = data.reduce((acc: any, curr: any) => {
        const key = curr.responsable || 'Sistema';
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += 1;
        return acc;
      }, {});

      this.cancelacionesPorResponsable = Object.keys(agrupado).map(key => ({
        name: key,
        value: agrupado[key]
      }));
    });
  }
}
