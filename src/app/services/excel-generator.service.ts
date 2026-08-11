import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelGeneratorService {

  constructor() {}

  // Exporta el historial de ventas a un fichero Excel con nombre incluye la fecha actual
  exportarHistorialVentas(ventas: any[]) {

    // Mapeamos los datos para que los encabezados del Excel sean legibles
    const filas = ventas.map(venta => ({
      'ID Venta':      venta.id,
      'Vendedor':      venta.username,
      'Producto':      venta.nameproducto,
      'Cantidad':      venta.cantidad,
      'Importe Total': venta.importe,
      'DNI Cliente':   venta.dnicliente,
      'Fecha':         venta.fecha,
      'Hora':          venta.hora
    }));

    const hoja: XLSX.WorkSheet  = XLSX.utils.json_to_sheet(filas);
    const libro: XLSX.WorkBook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Historial Ventas');

    const fechaActual = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Reporte_Ventas_${fechaActual}.xlsx`);
  }
}
