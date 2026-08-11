import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Controla si se muestra el formulario de login o la pantalla de bienvenida
  isLoggedIn: boolean = true;

  // Datos del formulario
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  // Alterna entre mostrar el formulario de login y la pantalla inicial
  click_logIn() {
    this.isLoggedIn = !this.isLoggedIn;
  }

  // Cambia el idioma de la aplicación
  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

  // Envía las credenciales al backend y redirige al home si son correctas
  onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (respuesta) => {
        this.authService.saveToken(respuesta.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toastService.showToast('Error', 'Invalid username or password', true, 'Error');
      }
    });
  }
}
