import { Component, OnInit } from '@angular/core';

import { VentasCanceladasService } from '../../services/ventas-canceladas.service';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { VentasUserService } from '../../services/ventas-user.service';
import { ArticuloService } from '../../services/articulo.service';
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

  // --- KPI CARDS ---
  kpiTotalVendido: number = 0;
  kpiVentasHoy: number = 0;
  kpiStockBajo: number = 0;
  kpiCancelacion: number = 0;

  private rawTotalVendido: number = 0;
  private rawVentasHoy: number = 0;
  private rawStockBajo: number = 0;
  private rawCancelacion: number = 0;
  private totalVentas: number = 0;
  private totalCancelaciones: number = 0;
  private datosListos: number = 0;

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
    private canceladasService: VentasCanceladasService,
    private articuloService: ArticuloService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarDatosVentas();
    this.cargarDatosCancelaciones();
    this.cargarStockBajo();
  }

  // 1. CARGAR Y AGRUPAR VENTAS
  cargarDatosVentas() {
    this.ventaService.cargarVentas().subscribe(data => {
      const agrupado = data.reduce((acc: any, curr: any) => {
        const key = curr.username || 'Desconocido';
        if (!acc[key]) acc[key] = 0;
        acc[key] += curr.importe;
        return acc;
      }, {});
      this.ventasPorVendedor = Object.keys(agrupado).map(key => ({ name: key, value: agrupado[key] }));

      // KPIs
      this.rawTotalVendido = data.reduce((acc: number, v: any) => acc + v.importe, 0);
      const hoy = new Date().toISOString().split('T')[0];
      this.rawVentasHoy = data.filter((v: any) => v.fecha === hoy).length;
      this.totalVentas = data.length;
      this.checkYAnimar();
    });
  }

  // 2. CARGAR Y AGRUPAR CANCELACIONES
  cargarDatosCancelaciones() {
    this.canceladasService.getCancelaciones().subscribe(data => {
      const agrupado = data.reduce((acc: any, curr: any) => {
        const key = curr.responsable || 'Sistema';
        if (!acc[key]) acc[key] = 0;
        acc[key] += 1;
        return acc;
      }, {});
      this.cancelacionesPorResponsable = Object.keys(agrupado).map(key => ({ name: key, value: agrupado[key] }));

      // KPI
      this.totalCancelaciones = data.length;
      this.checkYAnimar();
    });
  }

  // 3. CARGAR STOCK BAJO
  cargarStockBajo() {
    this.articuloService.cargarArticulos().subscribe(data => {
      this.rawStockBajo = data.filter(a => a.cantidad <= 5).length;
      this.checkYAnimar();
    });
  }

  private checkYAnimar(): void {
    this.datosListos++;
    if (this.datosListos < 3) return;

    const total = this.totalVentas + this.totalCancelaciones;
    this.rawCancelacion = total > 0
      ? parseFloat(((this.totalCancelaciones / total) * 100).toFixed(1))
      : 0;

    this.animarContador(this.rawTotalVendido, v => this.kpiTotalVendido = v);
    this.animarContador(this.rawVentasHoy,    v => this.kpiVentasHoy = v);
    this.animarContador(this.rawStockBajo,    v => this.kpiStockBajo = v);
    this.animarContador(this.rawCancelacion,  v => this.kpiCancelacion = v, true);
  }

  private animarContador(valorFinal: number, setter: (v: number) => void, esDecimal = false): void {
    const pasos = 60;
    const intervalo = 1500 / pasos;
    let paso = 0;
    const timer = setInterval(() => {
      paso++;
      const ease = 1 - Math.pow(1 - paso / pasos, 2);
      const val = valorFinal * ease;
      setter(esDecimal ? parseFloat(val.toFixed(1)) : Math.round(val));
      if (paso >= pasos) clearInterval(timer);
    }, intervalo);
  }
}
