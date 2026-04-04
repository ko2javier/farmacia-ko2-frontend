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
  mostrarFormulario = false;
  errorMessage: string = '';
  tipoDocumento: string = "";
  identificacion: string = "";

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
    this.carritoService.obtenerCarrito().subscribe((productos) => {
      this.carrito = productos.filter(item => item.cantidadCompra > 0);
    });
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  eliminarDelCarrito(id: number) {
    this.carritoService.reducirCantidad(id);
  }

  vaciarCarrito() {
    this.mostrarFormulario = false;
    this.carritoService.vaciarCarrito();
  }

  /**
   * 📌 Validar Identificacion (CON TRADUCCIÓN)
   */
  validarIdentificacion(tipo: string, valor: string): boolean {
    // Obtenemos el título "Error" traducido
    const tituloError = this.translate.instant('CARRITO.MSG.ERROR_TITULO');

    switch (tipo) {
      case "":
      case "Choose...":
      case "Elige...": // Añadido por si acaso viene en español
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
        // TRADUCCIÓN CON VARIABLE {{tipo}}
        const msg = this.translate.instant('CARRITO.MSG.TIPO_NO_VALIDO', { tipo: tipo });
        this.toastService.showToast(tituloError, msg, true, "Error");
        return false;
    }
    return true;
  }

  showform(){
    this.mostrarFormulario = (!this.mostrarFormulario) ? true : false;
  }

  Completar() {
    if (!this.validarIdentificacion(this.tipoDocumento, this.identificacion)) {
      return;
    }
    this.registrarVenta();
  }

  // 1) Función para validar los ítems carrito (CON TRADUCCIÓN)
  validarItems(carrito: any[]): boolean {
    const tituloError = this.translate.instant('CARRITO.MSG.ERROR_TITULO');

    for (const item of carrito) {
      if (item.cantidadCompra > item.articulo.cantidad) {

        // TRADUCCIÓN CON VARIABLES {{nombre}} y {{cantidad}}
        const msg = this.translate.instant('CARRITO.MSG.NO_STOCK', {
          nombre: item.articulo.nombre,
          cantidad: item.articulo.cantidad
        });

        this.toastService.showToast(tituloError, msg, true, 'Error');
        return false;
      }
    }
    return true;
  }

  registrarVenta() {
    if (!this.validarItems(this.carrito)) {
      return;
    }

    const ventasDTO: VentaDTO[] = this.carrito.map(item => ({
      dnicliente: this.identificacion,
      nameproducto: item.articulo.nombre,
      cantidad: item.cantidadCompra,
      importe: item.articulo.precio * item.cantidadCompra,
      codigo: item.articulo.codigo
    }));

    this.ventasService.registrarVentas(ventasDTO).subscribe({
      next: (response: VentaUsuario[]) => {
        // 3) SWEET ALERT TRADUCIDO 🍬
        Swal.fire({
          title: this.translate.instant('CARRITO.MSG.SWAL_TITULO'),
          text: this.translate.instant('CARRITO.MSG.SWAL_TEXTO'),
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: this.translate.instant('CARRITO.MSG.SWAL_SI'),
          cancelButtonText: this.translate.instant('CARRITO.MSG.SWAL_NO'),
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        }).then((result) => {

          if (result.isConfirmed) {
            const datosVenta = {
              id: response[0]?.id || 'BATCH',
              dnicliente: this.identificacion
            };
            this.pdfService.imprimirTicket(datosVenta, this.carrito);
          }

          this.actualizarStockBatch();
          this.vaciarCarrito();

          // TOAST FINAL TRADUCIDO
          const tituloExito = this.translate.instant('CARRITO.MSG.EXITO_TITULO');
          this.toastService.showToast(tituloExito, this.translate.instant('CARRITO.MSG.PROCESO_OK'), false, 'Success');
        });

      },
      error: (err: any) => {
        const tituloError = this.translate.instant('CARRITO.MSG.ERROR_TITULO');
        this.toastService.showToast(tituloError, this.translate.instant('CARRITO.MSG.ERROR_REGISTRO'), true, 'Error');
      }
    });
  }


  actualizarStockBatch(): void {
    const updates: UpdateDto[] = this.carrito
      .filter(item => item.cantidadCompra > 0)
      .map(item => ({
        codigo: item.articulo.codigo,
        cantidadVendida: item.cantidadCompra
      }));

    this.articuloService.updateStockBatch(updates).subscribe({
      next: () => {},
      error: (err: any) => {
        if (err.status === 409) {
          this.toastService.showToast(
            'Conflicto de stock',
            'El stock fue modificado por otro usuario. Por favor recarga e inténtalo de nuevo.',
            true,
            'Error'
          );
        } else {
          this.toastService.showToast(
            'Error',
            'No se pudo actualizar el stock. Contacta con el administrador.',
            true,
            'Error'
          );
        }
      }
    });
  }

  calcularTotal(): number {
    return this.carrito.reduce((suma, item) =>
      suma + (item.cantidadCompra * item.articulo.precio), 0
    );
  }
}
