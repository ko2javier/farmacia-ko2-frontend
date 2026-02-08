import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AlmacenComponent } from './componentes/almacen/almacen.component';
import { VentasUsuarioComponent } from './componentes/ventas-usuario/ventas-usuario.component';

import { PanelComponent } from './componentes/panel/panel.component';
import { ResultadosBusquedaComponent } from './componentes/resultados-busqueda/resultados-busqueda.component';
import { CarritoComponent } from './componentes/carrito/carritocomponent';
import { UsersComponent } from './componentes/users/users.component';
import { VentasCanceladasComponent } from './componentes/ventas-canceladas/ventas-canceladas.component';






@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AlmacenComponent,
    VentasUsuarioComponent,
    PanelComponent,
    ResultadosBusquedaComponent,
    CarritoComponent,
    UsersComponent,
    VentasCanceladasComponent



  ],
  imports: [
    BrowserModule,

    AppRoutingModule,
    HttpClientModule,
    FormsModule,


  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
