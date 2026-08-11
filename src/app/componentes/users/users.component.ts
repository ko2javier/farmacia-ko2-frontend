import { Component, Input, OnInit } from '@angular/core';
import { Usuarios } from '../../models/usuarios';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { Insert_User_DTO } from '../../models/Insert_User_DTO';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  // Rol del usuario logado — lo recibe el padre para controlar qué acciones se muestran
  @Input() userRole: string = '';

  // Lista completa de usuarios cargada del backend
  listaUsuarios: Usuarios[] = [];

  // Control de paginación
  rowsPerPage: number = 8;
  paginaActual: number = 1;
  totalPaginas: number = 0;
  usuariosPaginados: Usuarios[] = [];

  // Controla qué formulario se muestra: insertar, editar o ninguno
  operation: 'insert' | 'update' | 'none' = 'none';
  formularioValido: boolean = false;

  // Usuario seleccionado para editar
  selectedUser: Usuarios = { id: 0, username: '', password: '', enabled: 1, permiso: '' };
  // Datos del formulario de nuevo usuario
  newUser: Insert_User_DTO = { username: '', password: '', permiso: '' };

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Pide todos los usuarios al backend y los muestra en la tabla
  cargarUsuarios(): void {
    this.userService.cargarUsuarios().subscribe({
      next: (usuarios: Usuarios[]) => {
        this.listaUsuarios = usuarios;
        this.totalPaginas  = Math.ceil(usuarios.length / this.rowsPerPage);
        this.mostrarPagina(1);
      },
      error: () => {
        this.toastService.showToast(
          this.translate.instant('USUARIOS.MSG.ERROR_TITULO'),
          this.translate.instant('USUARIOS.MSG.CARGAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }

  // Recorta la lista para mostrar solo los usuarios de la página actual
  mostrarPagina(pagina: number): void {
    const inicio = (pagina - 1) * this.rowsPerPage;
    const fin    = inicio + this.rowsPerPage;
    this.usuariosPaginados = this.listaUsuarios.slice(inicio, fin);
  }

  // Cambia de página si el número es válido
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.mostrarPagina(pagina);
    }
  }

  // Controla qué formulario se muestra en pantalla
  setMode(mode: 'none' | 'insert' | 'update', usuario?: Usuarios) {
    switch (mode) {
      case 'update':
        this.operation  = 'update';
        if (usuario) this.selectedUser = { ...usuario, password: '' };
        break;
      case 'insert':
        this.operation = 'insert';
        this.newUser   = { username: '', password: '', permiso: '' };
        break;
      case 'none':
      default:
        this.operation   = 'none';
        this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: '' };
        this.newUser      = { username: '', password: '', permiso: '' };
        break;
    }
  }

  // Muestra confirmación y elimina el usuario si el admin confirma
  deleteUsuario(id: number): void {
    Swal.fire({
      title:             this.translate.instant('USUARIOS.MSG.ELIMINAR_TITULO'),
      text:              this.translate.instant('USUARIOS.MSG.ELIMINAR_TEXTO'),
      icon:              'warning',
      showCancelButton:  true,
      confirmButtonColor: '#d33',
      cancelButtonColor:  '#3085d6',
      confirmButtonText: this.translate.instant('USUARIOS.MSG.BTN_ELIMINAR'),
      cancelButtonText:  this.translate.instant('USUARIOS.MSG.BTN_CANCELAR')
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.userService.eliminarUsuario(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('USUARIOS.MSG.ELIMINADO_TITULO'),
              this.translate.instant('USUARIOS.MSG.ELIMINADO_TEXTO'),
              'success'
            );
            this.cargarUsuarios();
          },
          error: () => {
            Swal.fire(
              this.translate.instant('USUARIOS.MSG.ERROR_TITULO'),
              this.translate.instant('USUARIOS.MSG.ELIMINAR_ERROR'),
              'error'
            );
          }
        });
      }
    });
  }

  // Valida los datos del formulario de inserción antes de enviarlos
  validarInsercion(): boolean {
    this.formularioValido = true;
    const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');

    if (!this.newUser.username || this.newUser.username.length < 3) {
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.USER_INVALIDO'), true, 'Error');
      this.formularioValido = false;
    } else if (!this.newUser.password || this.newUser.password.length < 4) {
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PASS_INVALIDO'), true, 'Error');
      this.formularioValido = false;
    } else if (!this.newUser.permiso || this.newUser.permiso === '') {
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PERMISO_NULL'), true, 'Error');
      this.formularioValido = false;
    }

    return this.formularioValido;
  }

  // Valida los datos del formulario de edición antes de enviarlos
  validarActualizacion(): boolean {
    this.formularioValido = true;
    const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');

    if (!this.selectedUser.password || this.selectedUser.password.length < 4) {
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PASS_INVALIDO'), true, 'Error');
      this.formularioValido = false;
    } else if (!this.selectedUser.permiso || this.selectedUser.permiso === '') {
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PERMISO_NULL'), true, 'Error');
      this.formularioValido = false;
    }

    return this.formularioValido;
  }

  // Comprueba que el usuario no existe ya y lo inserta en el backend
  insertUsuario(): void {
    if (!this.validarInsercion()) return;

    const yaExiste = this.listaUsuarios.some(
      usuario => usuario.username.toLowerCase() === this.newUser.username.toLowerCase()
    );

    if (yaExiste) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('USERS.DUPLICATE_TITLE'),
        text:  this.translate.instant('USERS.DUPLICATE_TEXT')
      });
      return;
    }

    this.userService.insertUser(this.newUser).subscribe({
      next: () => {
        this.toastService.showToast(
          this.translate.instant('USUARIOS.MSG.EXITO_TITULO'),
          this.translate.instant('USUARIOS.MSG.CREADO_EXITO'),
          false, 'Success'
        );
        this.cargarUsuarios();
        this.newUser = { username: '', password: '', permiso: '' };
        this.setMode('none');
      },
      error: (err) => {
        if (err.status === 409) {
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('USERS.DUPLICATE_TITLE'),
            text:  this.translate.instant('USERS.DUPLICATE_TEXT')
          });
        } else {
          this.toastService.showToast(
            this.translate.instant('USUARIOS.MSG.ERROR_TITULO'),
            this.translate.instant('USUARIOS.MSG.CREAR_ERROR'),
            true, 'Error'
          );
        }
      }
    });
  }

  // Envía los cambios del usuario editado al backend
  updateUsuario(): void {
    if (!this.validarActualizacion()) return;

    this.userService.actualizarUsuario(this.selectedUser).subscribe({
      next: () => {
        this.toastService.showToast(
          this.translate.instant('USUARIOS.MSG.EXITO_TITULO'),
          this.translate.instant('USUARIOS.MSG.ACTUALIZADO_EXITO'),
          false, 'Success'
        );
        this.cargarUsuarios();
        this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: '' };
        this.setMode('none');
      },
      error: () => {
        this.toastService.showToast(
          this.translate.instant('USUARIOS.MSG.ERROR_TITULO'),
          this.translate.instant('USUARIOS.MSG.ACTUALIZAR_ERROR'),
          true, 'Error'
        );
      }
    });
  }
}
