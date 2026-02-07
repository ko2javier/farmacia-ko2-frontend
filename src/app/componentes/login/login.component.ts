import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

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
 
  
   constructor(private authService: AuthService, private router: Router, private toastService: ToastService ) { }

   click_logIn(){
    this.isLoggedIn=(this.isLoggedIn)?false:true;
    
   }

   onLogin(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token); // Guarda el token
        console.log(response.token);
        this.router.navigate(['/home']); // Redirige al componente "Home"
      },
      error: (error) => {
        console.error('Error during login:', error);
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

