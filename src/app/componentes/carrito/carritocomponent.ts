import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { CarritoItem } from '../../models/CarritoItem';
import { ToastService } from '../../services/toast.service';
import { VentaDTO } from '../../models/VentaDTO';
import { VentasUserService } from '../../services/ventas-user.service';
import { VentaUsuario } from '../../models/VentaUsuario';
import { ArticuloService } from '../../services/articulo.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { PdfGeneratorService } from '../../services/pdf-generator.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-carrito',
  standalone: false,
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {

  // Controla si se muestra el formulario de identificación del cliente
  mostrarFormulario = false;

  // Datos del cliente que se rellenan en el formulario antes de pagar
  tipoDocumento: string = "";
  identificacion: string = "";

  // Lista de productos que hay actualmente en el carrito
  carrito: CarritoItem[] = [];

  constructor(
    public carritoService: CarritoService,
    private toastService: ToastService,
    private ventasService: VentasUserService,
    private articuloService: ArticuloService,
    private pdfService: PdfGeneratorService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Nos suscribimos al carrito y filtramos los productos con cantidad mayor a 0
    this.carritoService.obtenerCarrito().subscribe((productos) => {
      this.carrito = productos.filter(producto => producto.cantidadCompra > 0);
    });
  }

  // Reduce en 1 la cantidad de un producto. Si llega a 0 desaparece del carrito
  eliminarDelCarrito(id: number) {
    this.carritoService.reducirCantidad(id);
  }

  // Vacía el carrito y oculta el formulario de pago
  vaciarCarrito() {
    this.mostrarFormulario = false;
    this.carritoService.vaciarCarrito();
  }

  // Muestra u oculta el formulario de identificación del cliente
  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  // Comprueba que el documento de identidad tenga el formato correcto según su tipo
  validarIdentificacion(tipo: string, valor: string): boolean {
    const tituloError = this.translate.instant('CARRITO.MSG.ERROR_TITULO');

    switch (tipo) {
      case "":
      case "Choose...":
      case "Elige...":
        this.toastService.showToast(tituloError, this.translate.instant('CARRITO.MSG.ESCOJA_DOC'), true, "Error");
        return false;

      case "DNI":
        if (!/^[0-9]{8}[A-Za-z]$/.test(valor.toUpperCase())) {
          this.toastService.showToast(tituloError, this.translate.instant('CARRITO.MSG.ERROR_DNI'), true, "Error");
          return false;
        }
        break;

      case "NIE":
        if (!/^[XYZ][0-9]{7}[A-Za-z]$/.test(valor.toUpperCase())) {
          this.toastService.showToast(tituloError, this.translate.instant('CARRITO.MSG.ERROR_NIE'), true, "Error");
          return false;
        }
        break;

      default:
        const mensaje = this.translate.instant('CARRITO.MSG.TIPO_NO_VALIDO', { tipo: tipo });
        this.toastService.showToast(tituloError, mensaje, true, "Error");
        return false;
    }
    return true;
  }

  // Valida el formulario y lanza el proceso de venta
  completarVenta() {
    if (!this.validarIdentificacion(this.tipoDocumento, this.identificacion)) {
      return;
    }
    this.registrarVenta();
  }

  // Comprueba que ningún producto del carrito supere el stock disponible
  validarItems(carrito: any[]): boolean {
    const tituloError = this.translate.instant('CARRITO.MSG.ERROR_TITULO');

    for (const producto of carrito) {
      if (producto.cantidadCompra > producto.articulo.cantidad) {
        const mensaje = this.translate.instant('CARRITO.MSG.NO_STOCK', {
          nombre: producto.articulo.nombre,
          cantidad: producto.articulo.cantidad
        });
        this.toastService.showToast(tituloError, mensaje, true, 'Error');
        return false;
      }
    }
    return true;
  }

  // Envía la venta al backend y pregunta al usuario si quiere imprimir el ticket
  registrarVenta() {
    if (!this.validarItems(this.carrito)) return;

    // Construimos el array de ventas que espera el backend
    const ventasDTO: VentaDTO[] = this.carrito.map(producto => ({
      dnicliente:   this.identificacion,
      nameproducto: producto.articulo.nombre,
      cantidad:     producto.cantidadCompra,
      importe:      producto.articulo.precio * producto.cantidadCompra,
      codigo:       producto.articulo.codigo
    }));

    this.ventasService.registrarVentas(ventasDTO).subscribe({
      next: (ventasRegistradas: VentaUsuario[]) => {
        Swal.fire({
          title:             this.translate.instant('CARRITO.MSG.SWAL_TITULO'),
          text:              this.translate.instant('CARRITO.MSG.SWAL_TEXTO'),
          icon:              'success',
          showCancelButton:  true,
          confirmButtonText: this.translate.instant('CARRITO.MSG.SWAL_SI'),
          cancelButtonText:  this.translate.instant('CARRITO.MSG.SWAL_NO'),
          confirmButtonColor: '#3085d6',
          cancelButtonColor:  '#d33'
        }).then((resultado) => {

          // Si el usuario confirma, generamos el PDF del ticket
          if (resultado.isConfirmed) {
            const datosVenta = {
              id: ventasRegistradas[0]?.id || 'BATCH',
              dnicliente: this.identificacion
            };
            this.pdfService.imprimirTicket(datosVenta, this.carrito);
          }

          this.actualizarStockBatch();
          this.vaciarCarrito();

          this.toastService.showToast(
            this.translate.instant('CARRITO.MSG.EXITO_TITULO'),
            this.translate.instant('CARRITO.MSG.PROCESO_OK'),
            false, 'Success'
          );
        });
      },
      error: () => {
        this.toastService.showToast(
          this.translate.instant('CARRITO.MSG.ERROR_TITULO'),
          this.translate.instant('CARRITO.MSG.ERROR_REGISTRO'),
          true, 'Error'
        );
      }
    });
  }

  // Descuenta del stock de cada artículo la cantidad vendida en esta venta
  actualizarStockBatch(): void {
    const actualizaciones: UpdateDto[] = this.carrito
      .filter(producto => producto.cantidadCompra > 0)
      .map(producto => ({
        codigo:          producto.articulo.codigo,
        cantidadVendida: producto.cantidadCompra
      }));

    this.articuloService.updateStockBatch(actualizaciones).subscribe({
      next: () => {},
      error: (err: any) => {
        if (err.status === 409) {
          this.toastService.showToast('Conflicto de stock', 'El stock fue modificado por otro usuario. Por favor recarga e inténtalo de nuevo.', true, 'Error');
        } else {
          this.toastService.showToast('Error', 'No se pudo actualizar el stock. Contacta con el administrador.', true, 'Error');
        }
      }
    });
  }

  // Suma el importe total de todos los productos del carrito
  calcularTotal(): number {
    return this.carrito.reduce((suma, producto) =>
      suma + (producto.cantidadCompra * producto.articulo.precio), 0
    );
  }
}
