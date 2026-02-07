import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelGeneratorService {

  constructor() { }

  exportarHistorialVentas(data: any[]) {
    // 1. Mapeamos los datos para que los encabezados del Excel sean legibles
    const datosParaExcel = data.map(venta => ({
      'ID Venta': venta.id,
      'Vendedor': venta.username,
      'Producto': venta.nameproducto, // Ajusta según tu modelo exacto
      'Cantidad': venta.cantidad,
      'Importe Total': venta.importe, // El Excel lo tratará como número
      'DNI Cliente': venta.dnicliente,
      'Fecha': venta.fecha, // Si viene como string '2026-02-07', Excel lo entiende
      'Hora': venta.hora
    }));

    // 2. Crear una hoja de cálculo (Worksheet)
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExcel);

    // 3. Crear un libro de trabajo (Workbook) y añadir la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial Ventas');

    // 4. Guardar el archivo (Esto dispara la descarga en el navegador)
    const fechaActual = new Date().toISOString().slice(0,10); // Ejemplo: 2026-02-07
    XLSX.writeFile(wb, `Reporte_Ventas_${fechaActual}.xlsx`);
  }
}