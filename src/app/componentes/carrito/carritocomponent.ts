import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
// import { Articulo } from '../../models/articulo'; // No parece usarse explícitamente, pero puedes dejarlo si quieres
import { CarritoItem } from '../../models/CarritoItem';
import { ToastService } from '../../services/toast.service';
import { VentaDTO } from '../../models/VentaDTO';
import { VentasUserService } from '../../services/ventas-user.service';
import { VentaUsuario } from '../../models/VentaUsuario';
import { ArticuloService } from '../../services/articulo.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import Swal from 'sweetalert2'; // 👈 1. IMPORTANTE: Añadimos SweetAlert

@Component({
  selector: 'app-carrito',
  standalone: false,
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  mostrarFormulario = false;
  errorMessage: string = '';
  tipoDocumento: string = "";  // Almacena el tipo de documento (DNI/NIE)
  identificacion: string = ""; // Almacena el valor ingresado

  carrito: CarritoItem[] = [];

  constructor(
    public carritoService: CarritoService,
    private toastService: ToastService,
    private ventasService: VentasUserService,
    private articuloService: ArticuloService,
    private pdfService: PdfGeneratorService
  ) {}

  ngOnInit() {
    this.carritoService.obtenerCarrito().subscribe((productos) => {
      this.carrito = productos.filter(item => item.cantidadCompra > 0);
    });
  }

  /**
   * 📌 Elimina un producto del carrito
   */
  eliminarDelCarrito(id: number) {
    this.carritoService.reducirCantidad(id);
  }

  /**
   * 📌 Vacía todo el carrito
   */
  vaciarCarrito() {
    this.mostrarFormulario = false;
    this.carritoService.vaciarCarrito();
  }

  /**
   * 📌 Validar Identificacion
   */
  validarIdentificacion(tipo: string, valor: string): boolean {
    switch (tipo) {
      case "":
      case "Choose...":
        this.toastService.showToast("Error", "❌ Escoja tipo de Documento !!", true, "Error");
        return false;

      case "DNI":
        if (!/^[0-9]{8}[A-Za-z]$/.test(valor.toUpperCase())) {
          this.toastService.showToast("Error", "❌ DNI inválido. Debe tener 8 números y 1 letra final.", true, "Error");
          return false;
        }
        break;

      case "NIE":
        if (!/^[XYZ][0-9]{7}[A-Za-z]$/.test(valor.toUpperCase())) {
          this.toastService.showToast("Error", "❌ NIE inválido. Debe comenzar con X, Y o Z, seguido de 7 números y una letra.", true, "Error");
          return false;
        }
        break;

      default:
        this.toastService.showToast("Error", `❌ Tipo de documento '${tipo}' no válido.`, true, "Error");
        return false;
    }
    return true;
  }

  showform(){
    this.mostrarFormulario = (!this.mostrarFormulario) ? true : false;
  }

  Completar() {
    // Validar DNI/NIE antes de continuar
    if (!this.validarIdentificacion(this.tipoDocumento, this.identificacion)) {
      console.warn("No se puede completar la compra: Identificación no válida.");
      return;
    }

    console.log("✅ Identificación válida, procesando compra...");
    this.registrarVenta(); // Pasamos al siguiente paso
  }

  // 1) Función para validar los ítems carrito
  validarItems(carrito: any[]): boolean {
    for (const item of carrito) {
      // Caso: cantidadCompra > stock
      if (item.cantidadCompra > item.articulo.cantidad) {
        this.toastService.showToast(
          'Error',
          `❌ No hay suficiente stock para ${item.articulo.nombre}. Solo dispones de ${item.articulo.cantidad} unidades.`,
          true,
          'Error'
        );
        return false; // Interrumpir validación
      }
    }
    return true;
  }

  // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
  registrarVenta() {
    // 0. Primero validamos todos los ítems del carrito
    if (!this.validarItems(this.carrito)) {
      return;
    }

    // 1. Generar el array de VentaDTO
    const ventasDTO: VentaDTO[] = this.carrito.map(item => ({
      dnicliente: this.identificacion,
      nameproducto: item.articulo.nombre,
      cantidad: item.cantidadCompra,
      importe: item.articulo.precio * item.cantidadCompra,
      codigo: item.articulo.codigo
    }));

    // 2) Llamas al servicio
    this.ventasService.registrarVentas(ventasDTO).subscribe({
      next: (response: VentaUsuario[]) => {
        console.log('Ventas registradas con éxito:', response);

        // 3) PREGUNTAR SI QUIERE TICKET (SweetAlert)
        Swal.fire({
            title: '¡Compra Exitosa!',
            text: '¿Deseas descargar el ticket de compra?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Sí, Imprimir Ticket',
            cancelButtonText: 'No, gracias',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {

            // Si el usuario dice que SÍ
            if (result.isConfirmed) {
                // Preparamos datos básicos para el ticket
                // Cogemos el ID de la primera venta como referencia, o uno aleatorio si es batch
                const datosVenta = {
                    id: response[0]?.id || 'BATCH',
                    dnicliente: this.identificacion
                };

                // Generamos el PDF usando el carrito ACTUAL (antes de vaciarlo)
                this.pdfService.imprimirTicket(datosVenta, this.carrito);
            }

            // --- PROCESO DE FINALIZACIÓN ---
            // Esto se ejecuta SIEMPRE (quiera ticket o no)

            // a) Registrar en historial de compras del cliente
            //this.registrarCompra(response);

            // b) Actualizar Stock en base de datos
            this.actualizarStockBatch();

            // c) Vaciar el carrito visual (Lo hacemos al final para que el PDF tenga datos)
            this.vaciarCarrito();

            // d) Mostrar toast informativo final
            this.toastService.showToast('Success', 'Proceso finalizado correctamente', false, 'Success');
        });

      },
      error: (err: any) => {
        console.error('Error al registrar ventas:', err);
        this.toastService.showToast(
          'Error',
          '❌ Error al registrar ventas',
          true,
          'Error'
        );
      }
    });
  }
/*
  registrarCompra(ventas: VentaUsuario[]) {
    const comprasDTO: ComprasCliente[] = ventas.map(venta => ({
      ventaId: venta.id,
      dnicliente: venta.dnicliente,
      producto: venta.nameproducto,
      cantidad: venta.cantidad,
      importe: venta.importe
    }));

    this.comprasService.registrarComprasCliente(comprasDTO).subscribe({
      next: (respuesta: ComprasCliente[]) => {
        console.log('Compras registradas en historial cliente:', respuesta);
      },
      error: (err) => {
        console.error('Error al registrar compras:', err);
      }
    });
  }*/

  actualizarStockBatch(): void {
    const updates: UpdateDto[] = this.carrito
      .filter(item => item.cantidadCompra > 0)
      .map(item => ({
        codigo: item.articulo.codigo,
        cantidadVendida: item.cantidadCompra
      }));

    this.articuloService.updateStockBatch(updates).subscribe({
      next: (response) => {
        console.log('Stock actualizado en batch:', response);
      },
      error: (err) => {
        console.error('Error al actualizar stock en batch:', err);
      }
    });
  }

  calcularTotal(): number {
    return this.carrito.reduce((suma, item) =>
      suma + (item.cantidadCompra * item.articulo.precio), 0
    );
  }
}
