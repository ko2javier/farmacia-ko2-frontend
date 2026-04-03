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
export class UsersComponent implements OnInit{

  @Input() userRole: string = '';

  lista_usuarios: Usuarios[] = [];
  rowsPerPage: number = 8;
  currentPage: number = 1;
  totalPages: number = 0;
  paginatedUsuarios: Usuarios[] = [];
  operation: 'insert' | 'update' | 'none' = 'none';
  flag_insert: boolean = false;

  selectedUser: Usuarios = { id: 0, username: '', password: '', enabled: 1, permiso: "" };
  newUser: Insert_User_DTO = {  username: '',   password: '',   permiso: '' };

  constructor(private user_service: UserService,
              private toastService: ToastService,
              private translate: TranslateService ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  cargarUsuarios(): void {
    this.user_service.cargarUsuarios().subscribe({
      next: (usuarios: Usuarios[]) => {
        this.lista_usuarios = usuarios;
        this.totalPages = Math.ceil(usuarios.length / this.rowsPerPage);
        this.displayTable(1);
      },
      error: (err) => {
        // TRADUCIDO
        const titulo = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');
        const msg = this.translate.instant('USUARIOS.MSG.CARGAR_ERROR');
        this.toastService.showToast(titulo, msg, true, 'Error');
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

  setMode(mode: 'none' | 'insert' | 'update', usuario?: Usuarios) {
    switch (mode) {
      case 'update':
        this.operation = 'update';
        if (usuario) {
          this.selectedUser = { ...usuario, password: '' };
        }
        break;
      case 'insert':
        this.operation = 'insert';
        this.newUser = { username: '', password: '',  permiso: "" };
        break;
      case 'none':
        this.operation = 'none';
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
    // SWEET ALERT TRADUCIDO 🍬
    Swal.fire({
      title: this.translate.instant('USUARIOS.MSG.ELIMINAR_TITULO'),
      text: this.translate.instant('USUARIOS.MSG.ELIMINAR_TEXTO'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: this.translate.instant('USUARIOS.MSG.BTN_ELIMINAR'),
      cancelButtonText: this.translate.instant('USUARIOS.MSG.BTN_CANCELAR')
    }).then((result) => {
      if (result.isConfirmed) {
        this.user_service.delete_user(id).subscribe({
          next: () => {
            Swal.fire(
              this.translate.instant('USUARIOS.MSG.ELIMINADO_TITULO'),
              this.translate.instant('USUARIOS.MSG.ELIMINADO_TEXTO'),
              'success'
            );
            this.cargarUsuarios();
          },
          error: (err) => {
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

  // VALIDACIONES TRADUCIDAS
  chequear_insert():boolean{
    this.flag_insert = true;
    const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');

    if(this.newUser.username==null || this.newUser.username.length<3){
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.USER_INVALIDO'), true, 'Error');
      this.flag_insert = false;

    }else if (this.newUser.password==null || this.newUser.password.length<4){
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PASS_INVALIDO'), true, 'Error');
      this.flag_insert = false;

    } else if (this.newUser.permiso==null || this.newUser.permiso === ""){
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PERMISO_NULL'), true, 'Error');
      this.flag_insert = false;
    }

    return this.flag_insert;
  }

  chequear_Update():boolean{
    this.flag_insert = true;
    const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');

    if (this.selectedUser.password==null || this.selectedUser.password.length<4){
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PASS_INVALIDO'), true, 'Error');
      this.flag_insert = false;

    } else if (this.selectedUser.permiso==null || this.selectedUser.permiso === "" ){
      this.toastService.showToast(tituloError, this.translate.instant('USUARIOS.MSG.PERMISO_NULL'), true, 'Error');
      this.flag_insert = false;
    }

    return this.flag_insert;
  }

  // INSERTAR USUARIO (TRADUCIDO)
  insertUsuario(): void {
    if (!this.chequear_insert()){
      return;
    }

    this.user_service.insertUser(this.newUser).subscribe({
      next: (usuarioCreado: Usuarios) => {
        const tituloExito = this.translate.instant('USUARIOS.MSG.EXITO_TITULO');
        const msgExito = this.translate.instant('USUARIOS.MSG.CREADO_EXITO');

        this.toastService.showToast(tituloExito, msgExito, false, 'Success');
        this.cargarUsuarios();
        this.newUser = { username: '', password: '',  permiso: "" };
        this.setMode('none');
      },
      error: (err) => {
        const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');
        const msgError = this.translate.instant('USUARIOS.MSG.CREAR_ERROR');
        this.toastService.showToast(tituloError, msgError, true, 'Error');
      }
    });
  }

  // ACTUALIZAR USUARIO (TRADUCIDO)
  updateUsuario(): void {
    if (!this.chequear_Update()){
      return;
    }

    this.user_service.Update_User (this.selectedUser).subscribe({
      next: (usuario_updated: Usuarios) => {
        const tituloExito = this.translate.instant('USUARIOS.MSG.EXITO_TITULO');
        const msgExito = this.translate.instant('USUARIOS.MSG.ACTUALIZADO_EXITO');

        this.toastService.showToast(tituloExito, msgExito, false, 'Success');
        this.cargarUsuarios();
        this.selectedUser = { id: 0, username: '', password: '', enabled: 1, permiso: "" };
        this.setMode('none');
      },
      error: (err) => {
        const tituloError = this.translate.instant('USUARIOS.MSG.ERROR_TITULO');
        const msgError = this.translate.instant('USUARIOS.MSG.ACTUALIZAR_ERROR');
        this.toastService.showToast(tituloError, msgError, true, 'Error');
      }
    });
  }

}
