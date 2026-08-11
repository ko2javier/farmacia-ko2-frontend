import { Component, OnInit } from '@angular/core';

import { VentasCanceladasService } from '../../services/ventas-canceladas.service';
import { Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { VentasUserService } from '../../services/ventas-user.service';
import { ArticuloService } from '../../services/articulo.service';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, TranslatePipe],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {

  // Lo que se pasa a las gráficas de ngx-charts
  ventasPorVendedor: any[] = [];
  cancelacionesPorResponsable: any[] = [];
  posicionLeyenda: LegendPosition = LegendPosition.Below;

  // Los 4 números que aparecen en las tarjetas KPI del HTML
  // Empiezan en 0 y se animan hasta el valor real al cargar la página
  kpiTotalVendido: number = 0;
  kpiVentasHoy: number = 0;
  kpiStockBajo: number = 0;
  kpiCancelacion: number = 0;

  // Los valores reales que llegan del backend
  // El HTML nunca los muestra directamente — primero pasan por la animación
  private rawTotalVendido: number = 0;
  private rawVentasHoy: number = 0;
  private rawStockBajo: number = 0;
  private rawCancelacion: number = 0;
  private totalVentas: number = 0;
  private totalCancelaciones: number = 0;

  // Lleva la cuenta de cuántas de las 3 peticiones HTTP han terminado
  // Cuando llega a 3, significa que todos los datos están listos
  private llamadasTerminadas: number = 0;

  view: [number, number] = [500, 300];

  colorSchemeVentas: Color = {
    name: 'ventasScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

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

  // Al entrar en la pantalla lanzamos las 3 peticiones al backend a la vez
  ngOnInit(): void {
    this.cargarDatosVentas();
    this.cargarDatosCancelaciones();
    this.cargarStockBajo();
  }

  // Pide todas las ventas y hace dos cosas:
  // 1. Agrupa por vendedor para pintar la gráfica de barras
  // 2. Calcula el total facturado y cuántas ventas hubo hoy
  cargarDatosVentas() {
    this.ventaService.cargarVentas().subscribe(ventas => {

      // Recorremos todas las ventas y vamos sumando el importe de cada vendedor
      // Resultado: { "javier": 150, "maria": 80 }
      const ventasPorVendedor: any = {};
      for (const venta of ventas) {
        const vendedor = venta.username || 'Desconocido';
        if (!ventasPorVendedor[vendedor]) ventasPorVendedor[vendedor] = 0;
        ventasPorVendedor[vendedor] += venta.importe;
      }

      // ngx-charts no acepta un objeto plano, necesita un array de { name, value }
      this.ventasPorVendedor = Object.keys(ventasPorVendedor).map(vendedor => ({
        name: vendedor,
        value: ventasPorVendedor[vendedor]
      }));

      // Sumamos todos los importes para obtener el total facturado
      let sumaTotal = 0;
      for (const venta of ventas) {
        sumaTotal += venta.importe;
      }
      this.rawTotalVendido = sumaTotal;

      // Filtramos solo las ventas de hoy comparando la fecha
      const hoy = new Date().toISOString().split('T')[0]; // formato "2026-05-24"
      this.rawVentasHoy = ventas.filter((venta: any) => venta.fecha === hoy).length;
      this.totalVentas = ventas.length;

      this.verificarYAnimar();
    });
  }

  // Pide todas las cancelaciones y las agrupa por responsable para la gráfica
  cargarDatosCancelaciones() {
    this.canceladasService.getCancelaciones().subscribe(cancelaciones => {

      // Contamos cuántas cancelaciones hizo cada responsable
      // Resultado: { "maria": 3, "sistema": 1 }
      const cancelacionesPorResponsable: any = {};
      for (const cancelacion of cancelaciones) {
        const responsable = cancelacion.responsable || 'Sistema';
        if (!cancelacionesPorResponsable[responsable]) cancelacionesPorResponsable[responsable] = 0;
        cancelacionesPorResponsable[responsable] += 1;
      }

      this.cancelacionesPorResponsable = Object.keys(cancelacionesPorResponsable).map(responsable => ({
        name: responsable,
        value: cancelacionesPorResponsable[responsable]
      }));

      this.totalCancelaciones = cancelaciones.length;
      this.verificarYAnimar();
    });
  }

  // Pide todos los artículos y cuenta cuántos tienen stock crítico (5 unidades o menos)
  cargarStockBajo() {
    this.articuloService.cargarArticulos().subscribe(articulos => {
      this.rawStockBajo = articulos.filter(articulo => articulo.cantidad <= 5).length;
      this.verificarYAnimar();
    });
  }

  // Se llama cada vez que termina una petición HTTP
  // Solo actúa cuando las 3 han terminado — así evitamos animar con datos incompletos
  // El % de cancelación se calcula aquí porque necesita los datos de ventas Y cancelaciones a la vez
  private verificarYAnimar(): void {
    this.llamadasTerminadas++;
    if (this.llamadasTerminadas < 3) return;

    const total = this.totalVentas + this.totalCancelaciones;
    if (total > 0) {
      this.rawCancelacion = parseFloat(((this.totalCancelaciones / total) * 100).toFixed(1));
    } else {
      this.rawCancelacion = 0; // evita división por cero si no hay datos
    }

    this.animarKpi('kpiTotalVendido', this.rawTotalVendido);
    this.animarKpi('kpiVentasHoy',    this.rawVentasHoy);
    this.animarKpi('kpiStockBajo',    this.rawStockBajo);
    this.animarKpi('kpiCancelacion',  this.rawCancelacion, true);
  }

  // Hace que el número de una KPI suba de 0 al valor real en 1.5 segundos
  // La curva de ease hace que arranque rápido y frene suavemente al llegar al final
  private animarKpi(campo: 'kpiTotalVendido' | 'kpiVentasHoy' | 'kpiStockBajo' | 'kpiCancelacion', valorFinal: number, esDecimal = false): void {
    const pasos = 60;
    const intervalo = 1500 / pasos;
    let paso = 0;
    const timer = setInterval(() => {
      paso++;
      const ease = 1 - Math.pow(1 - paso / pasos, 2);
      const val = valorFinal * ease;
      this[campo] = esDecimal ? parseFloat(val.toFixed(1)) : Math.round(val);
      if (paso >= pasos) clearInterval(timer);
    }, intervalo);
  }
}
