export interface VentaUsuario {
    id: number;             // Identificador único de la venta
    fecha: string;          // Fecha de la venta (Formato: YYYY-MM-DD)
    hora: string;           // Hora de la venta (Formato: HH:mm:ss)
    username: string;       // Usuario que realizó la venta
    dnicliente: string;     // DNI del cliente
    nameproducto: string;   // Nombre del producto vendido
    cantidad: number;       // Cantidad vendida
    importe: number;        // Importe total de la venta
    idComprasCliente?: number; // ID opcional de la compra asociada
    codigo?:string ;
  }
  