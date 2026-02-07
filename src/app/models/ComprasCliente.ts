export interface ComprasCliente {
    id?: number;
    ventaId: number; // Relacionado con la venta (id_ventas_usuario en Java)
    dia?: string; // LocalDate en Java → string en TypeScript (formato "YYYY-MM-DD")
    hora?: string; // LocalTime en Java → string en TypeScript (formato "HH:mm:ss")
    producto: string;
    cantidad: number;
    importe: number;
    dnicliente: string;
  }
  