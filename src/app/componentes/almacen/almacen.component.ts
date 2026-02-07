import { Component } from '@angular/core';
import { ArticuloService } from '../../services/articulo.service';
import { Articulo } from '../../models/articulo';
import Swal from 'sweetalert2';
import { ToastService } from '../../services/toast.service';
import { UpdateDto } from '../../models/UpdateDTO';
import { InsertDto } from '../../models/InsertDto';

@Component({
  selector: 'app-almacen',
  standalone: false,
  templateUrl: './almacen.component.html',
  styleUrl: './almacen.component.css'
})
export class AlmacenComponent {
  articulos: Articulo[] = []; // Variable para almacenar los artículos
  respuesta:Boolean=false;

  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedArticulos: Articulo[] = [];
  operation: 'insert' | 'update' | 'none' = 'none';
  selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, 
    codigo: '' };
    insertDto: InsertDto = { nombre: '', categoria: '', precio: 0, cantidad: 0 };
  

  constructor(private articuloService: ArticuloService,
    private toastService: ToastService ) {}

  ngOnInit() {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.articuloService.cargarArticulos().subscribe(
      (data) => {
        this.articulos = data;
        this.totalPages = Math.ceil(this.articulos.length / this.rowsPerPage);
        this.displayTable(1);
      },
      (error) => {
        console.error('Error al obtener artículos', error);
      }
    );
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

/* aun sin definir los metodos de abajo*/
decrementQuantity(id:number) { }
incrementQuantity(id:number) { }

// Metodo para eliminar articulo

eliminarArticulo(id: number): void {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.articuloService.deleteArticulo(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El artículo se ha eliminado', 'success');
          this.cargarArticulos();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo eliminar el artículo', 'error');
        }
      });
    }
  });
}


// Metodo para cambiar a los diferentes Modos 'insert' | 'update' | 'none' = 'none'!!

setMode(mode: 'none' | 'insert' | 'update', articulo?: Articulo){
  switch(mode){

    case 'update':
      this.operation = 'update';
      this.selectedArticulo = { ...articulo! }; // ¡Forzamos la no-null assertion!
      
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

 // Metodo para hacer el update de un numero!!
updateArticulo() {
  // 0- valido que hay articulo sino out
  if (!this.selectedArticulo) return;

// 1- Valido que cant y precio son números y >0 sino out !!

  if (this.selectedArticulo.precio <= 0 || this.selectedArticulo.cantidad < 0) {
        /*
        this.toastService.showToast('ERROR', 'La cantidad y el precio deben ser números y mayores que 0',
           false, 'danger');*/
           this.toastService.showToast(
            'Error', '❌ Cantidad/ Precio deben ser números y >= 0', true, 'Error' );
        return;
}

  // 2- Construyo el objeto UpdateDto
  const updates: UpdateDto = {
    cantidadVendida:0,
    codigo: this.selectedArticulo.codigo,
    cantidad: this.selectedArticulo.cantidad,
    precio: this.selectedArticulo.precio
  };

  // 3- Llamo al service para actualizar
  this.articuloService.updateItem(updates).subscribe({
    next: (articuloActualizado) => {
      console.log('Artículo actualizado con éxito:', articuloActualizado);
      //Con Exito reflejamos al usuario que ok
        this.toastService.showToast('Éxito', 'Artículo actualizado', false, 'Success');

      // Refresco lista de artículos:
         this.cargarArticulos();

      // Salgo del modo 'update' y clean al artículo seleccionado
      this.selectedArticulo = { id: 0, nombre: '', categoria: '', precio: 0, cantidad: 0, codigo: '' };
      this.operation = 'none';
    },
    error: (err) => {
      console.error('Error al actualizar artículo:', err);
      this.toastService.showToast(
        'Error', '❌ No se pudo actualizar', true, 'Error' );
      
    }
  });
}

// Metodo para chequear los campos de articulo!!
chequear_art():Boolean{
  this.respuesta=true;
  
  if (this.insertDto.precio <= 0 || this.insertDto.cantidad < 0) {
    /*
    this.toastService.showToast('ERROR', 'La cantidad y el precio deben ser números y mayores que 0',
       false, 'danger');*/
       this.toastService.showToast(
        'Error', '❌ Cantidad/ Precio deben ser números y >= 0', true, 'Error' );
        this.respuesta=false;
    
 } else if( this.insertDto.nombre.length<3 || this.insertDto.categoria.length<3){

  this.toastService.showToast(
    'Error', '❌  3 Caracteres en Nombre/Categoria porfa ', true, 'Error' );
    this.respuesta=false;

 }
  
return this.respuesta;

}

insertArticulo() {

  if (!this.chequear_art()) {
    return;
  }
    // Llamada al servicio
    this.articuloService.insert_item(this.insertDto).subscribe({
      next: (articuloCreado) => {
        console.log('Artículo creado:', articuloCreado);
        // Muestra un toast o mensaje de éxito
        this.toastService.showToast('Éxito', 'Artículo Creado', false, 'Success');
  
        // Refrescar lista si deseas
          this.cargarArticulos();
  
        // Reiniciar formulario
        this.insertDto = { nombre: '',  categoria: '', precio: 0,  cantidad: 0 };
  
        // Volver a la vista principal
        this.setMode('none');
      },
      error: (err) => {
        console.error('Error al crear artículo:', err);
        this.toastService.showToast(
          'Error', '❌ No se pudo crear Articulo', true, 'Error' );
      }
    });
  }

 


 
  
}