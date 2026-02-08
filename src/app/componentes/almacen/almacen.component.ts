import { Component } from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { Articulo } from '../../models/articulo';
import Swal from 'sweetalert2';
import { ToastService } from '../../services/toast.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { InsertDto } from '../../models/InsertDto';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-almacen',
  standalone: false,
  templateUrl: './almacen.component.html',
  styleUrl: './almacen.component.css'
})
export class AlmacenComponent {
  articulos: Articulo[] = [];
  respuesta: Boolean = false;

  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedArticulos: Articulo[] = [];
  operation: 'insert' | 'update' | 'none' = 'none';

  selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
  insertDto: InsertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };

  isAdmin: boolean = false;

  constructor(
    private articuloService: ArticuloService,
    private toastService: ToastService,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.cargarArticulos();
    this.checkRole();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  cargarArticulos() {
    this.articuloService.cargarArticulos().subscribe(
      (data) => {
        this.articulos = data;
        this.totalPages = Math.ceil(this.articulos.length / this.rowsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
        this.displayTable(1);
      },
      (error) => {
        console.error('Error al obtener artículos', error);
      }
    );
  }

  checkRole(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.isAdmin = decoded.role === 'ADMIN' || decoded.role === 'ROLE_ADMIN';
      } catch (e) {
        this.isAdmin = false;
      }
    }
  }

  displayTable(page: number): void {
    const start = (page - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedArticulos = this.articulos.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.displayTable(page);
    }
  }

  decrementQuantity(id:number) { }
  incrementQuantity(id:number) { }

  // Metodo para eliminar articulo (TRADUCIDO)
  eliminarArticulo(id: number): void {
    Swal.fire({
      title: this.translate.instant('ALMACEN.MSG.ELIMINAR_TITULO'),
      text: this.translate.instant('ALMACEN.MSG.ELIMINAR_TEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('ALMACEN.MSG.BTN_ELIMINAR'),
      cancelButtonText: this.translate.instant('ALMACEN.MSG.BTN_CANCELAR')
    }).then((result) => {
      if (result.isConfirmed) {
        this.articuloService.deleteArticulo(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TITULO'),
              this.translate.instant('ALMACEN.MSG.ELIMINADO_TEXTO'),
              'success'
            );
            this.cargarArticulos();
          },
          error: (err) => {
            Swal.fire(
              this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
              this.translate.instant('ALMACEN.MSG.ELIMINAR_ERROR'),
              'error'
            );
          }
        });
      }
    });
  }

  setMode(mode: 'none' | 'insert' | 'update', articulo?: Articulo){
    switch(mode){
      case 'update':
        this.operation = 'update';
        this.selectedArticulo = { ...articulo! };
        break;
      case 'insert':
        this.operation = 'insert';
        break;
      case 'none':
        this.operation = 'none';
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
        break;
      default:
        this.operation = 'none';
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
        break;
    }
  }

  // UPDATE (TRADUCIDO)
  updateArticulo() {
    if (!this.selectedArticulo) return;

    if (this.selectedArticulo.precio <= 0 || this.selectedArticulo.cantidad < 0) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_NUMEROS'),
        true, 'Error'
      );
      return;
    }

    const updates: UpdateDto = {
      cantidadVendida:0,
      codigo: this.selectedArticulo.codigo,
      cantidad: this.selectedArticulo.cantidad,
      precio: this.selectedArticulo.precio
    };

    this.articuloService.updateItem(updates).subscribe({
      next: (articuloActualizado) => {
        console.log('Artículo actualizado con éxito:', articuloActualizado);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZADO_EXITO'),
          false, 'Success'
        );

        this.cargarArticulos();
        this.selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
        this.operation = 'none';
      },
      error: (err) => {
        console.error('Error al actualizar artículo:', err);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.ACTUALIZAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

  // Validaciones (TRADUCIDO)
  chequear_art():Boolean{
    this.respuesta = true;

    if (this.insertDto.precio <= 0 || this.insertDto.cantidad < 0) {
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_NUMEROS'),
        true, 'Error'
      );
      this.respuesta=false;

    } else if( this.insertDto.nombre.length<3 || this.insertDto.categoria.length<3){
      this.toastService.showToast(
        this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
        this.translate.instant('ALMACEN.MSG.VALIDACION_CARACTERES'),
        true, 'Error'
      );
      this.respuesta=false;
    }

    return this.respuesta;
  }

  // INSERTAR (TRADUCIDO)
  insertArticulo() {
    if (!this.chequear_art()) {
      return;
    }

    this.articuloService.insert_item(this.insertDto).subscribe({
      next: (articuloCreado) => {
        console.log('Artículo creado:', articuloCreado);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.EXITO_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREADO_EXITO'),
          false, 'Success'
        );

        this.cargarArticulos();
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
        this.setMode('none');
      },
      error: (err) => {
        console.error('Error al crear artículo:', err);
        this.toastService.showToast(
          this.translate.instant('ALMACEN.MSG.ERROR_TITULO'),
          this.translate.instant('ALMACEN.MSG.CREAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

}
