import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
   isLoggedIn:boolean=true;
   username: string = '';
   password: string = '';
   errorMessage: string = '';


   constructor(private authService: AuthService, private router: Router,
               private toastService: ToastService, private translate: TranslateService ) { }

   click_logIn(){
    this.isLoggedIn=(this.isLoggedIn)?false:true;

   }

  cambiarIdioma(idioma: string) {
    this.translate.use(idioma);
  }

   onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token); // Guarda el token
        this.router.navigate(['/home']); // Redirige al componente "Home"
      },
      error: (error) => {
        this.errorMessage = 'Invalid username or password.';

        this.toastService.showToast(
          'Error',
          'Invalid username or password',
          true,
          'Error'
        );
      }
    });
  }

}

