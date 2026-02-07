import { Component, OnInit } from '@angular/core';
import { Usuarios } from '../../models/usuarios';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { Insert_User_DTO } from '../../models/Insert_User_DTO';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{

  lista_usuarios: Usuarios[] = [];
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedUsuarios: Usuarios[] = [];
  operation: 'insert' | 'update' | 'none' = 'none';
  flag_insert:boolean =false;

 /* Variables para realizar el update y el insert mode!! */
 selectedUser: Usuarios = { id: 0, username: '', password: '', enabled: 1, permiso: "" };

 newUser: Insert_User_DTO = {  username: '',   password: '',   permiso: '' };

 constructor(private user_service: UserService, private toastService: ToastService ) {}

 ngOnInit(): void {
  this.cargarUsuarios();
}

cargarUsuarios(): void {
  this.user_service.cargarUsuarios().subscribe({
    next: (usuarios: Usuarios[]) => {

      console.log('Usuarios cargados:', usuarios);
      this.lista_usuarios = usuarios;
      this.totalPages = Math.ceil(usuarios.length / this.rowsPerPage);
      this.displayTable(1); 
    },
    error: (err) => {
      console.error('Error al cargar usuarios:', err);
      this.toastService.showToast('Error', 'Error al cargar usuarios', true, 'Error');
    }
  });
}

displayTable(page: number): void {
   
  const start = (page - 1) * this.rowsPerPage;
  const end = start + this.rowsPerPage;
  this.paginatedUsuarios = this.lista_usuarios.slice(start, end);
  
}

changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.displayTable(page);
  }
}

 // Metodo para el modo

 setMode(mode: 'none' | 'insert' | 'update', usuario?: Usuarios) {
   switch (mode) {
     case 'update':
       this.operation = 'update';
       if (usuario) {
         // Clonamos el objeto para evoid cambiar la lista de start
         this.selectedUser = { ...usuario, password: '' };
       }
       break;
     case 'insert':
       this.operation = 'insert';
       // Clear al newUser
       this.newUser = { username: '', password: '',  permiso: "" };
       break;
     case 'none':
       this.operation = 'none';
       // Limpiamos las variables
       this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: "" };
       this.newUser = { username: '', password: '',  permiso: "" };
       break;

     default:
       this.operation = 'none';
       this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: "" };
       this.newUser = { username: '', password: '', permiso: "" };
       break;
   }
 }

 deleteUsuario(id: number): void {
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
       this.user_service.delete_user(id).subscribe({
         next: () => {
           Swal.fire('Eliminado', 'El usuario se ha eliminado', 'success');
           this.cargarUsuarios();
         },
         error: (err) => {
           Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
         }
       });
     }
   });
 }


 

 /*
 1 - falta implenmentar estas funciones !! */

 // funcion chequeo lo que esta en formulario !!

chequear_insert():boolean{
  this.flag_insert =true;
  
  if(this.newUser.username==null || this.newUser.username.length<3){
    this.toastService.showToast('Error', 'Username no valido', true, 'Error');

     this.flag_insert =false;

  }else if (this.newUser.password==null || this.newUser.password.length<4){
    this.toastService.showToast('Error', 'Min 4 caracteres para la contraseña', true, 'Error');
    this.flag_insert =false;

  } else if (this.newUser.permiso==null ){
      this.toastService.showToast('Error', 'el permiso no puede ser null', true, 'Error');
    this.flag_insert =false;

    }



  return this.flag_insert;

}

chequear_Update():boolean{
  this.flag_insert =true;
  
  if (this.selectedUser.password==null || this.selectedUser.password.length<4){
    this.toastService.showToast('Error', 'Min 4 caracteres para la contraseña', true, 'Error');
    this.flag_insert =false;

  } else if (this.selectedUser.permiso==null ){
      this.toastService.showToast('Error', 'el permiso no puede ser null', true, 'Error');
    this.flag_insert =false;

    }

  return this.flag_insert;

}


// funcion Create new usuario
 insertUsuario(): void {
  // Valido campos vacios o errores!!
  if (!this.chequear_insert()){
    return;
  }
    
  // Llamada al service para insert el user
  this.user_service.insertUser(this.newUser).subscribe({
    next: (usuarioCreado: Usuarios) => {
      console.log('Usuario creado:', usuarioCreado);
      this.toastService.showToast('Éxito', 'Usuario creado con éxito', false, 'Success');
      // Refresco la lista 
      this.cargarUsuarios();
      
      // Clear al newUser
      this.newUser = { username: '', password: '',  permiso: "" };
      
      // I am out of mode=== inseert y voy pa' mode=none
      this.setMode('none');
    },
    error: (err) => {
      console.error('Error al insertar usuario:', err);
      this.toastService.showToast('Error', 'No se pudo insertar el usuario', true, 'Error');
    }
  });
}

// funcion Update User --> Paso Usuario completo
updateUsuario(): void {
  // Valido campos vacios o errores!!
  if (!this.chequear_Update()){
    return;
  }
    
  // Llamada al service para insert el user
  this.user_service.Update_User (this.selectedUser).subscribe({
    next: (usuario_updated: Usuarios) => {
      console.log('Usuario creado:', usuario_updated);
      this.toastService.showToast('Éxito', 'Usuario Actualizado', false, 'Success');
      // Refresco la lista 
      this.cargarUsuarios();
      
      // Clear al selected user
      this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: "" };
      
      // I am out of mode=== update y voy pa' mode=none
      this.setMode('none');
    },
    error: (err) => {
      console.error('Error al update usuario:', err);
      this.toastService.showToast('Error', 'No se pudo Actualizar el usuario', true, 'Error');
    }
  });
}

   

}





