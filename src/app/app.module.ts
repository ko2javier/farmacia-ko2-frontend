import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule,HttpClient  } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AlmacenComponent } from './componentes/almacen/almacen.component';
import { VentasUsuarioComponent } from './componentes/ventas-usuario/ventas-usuario.component';

import { PanelComponent } from './componentes/panel/panel.component';
import { ResultadosBusquedaComponent } from './componentes/resultados-busqueda/resultados-busqueda.component';
import { CarritoComponent } from './componentes/carrito/carritocomponent';
import { UsersComponent } from './componentes/users/users.component';
import { VentasCanceladasComponent } from './componentes/ventas-canceladas/ventas-canceladas.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { EstadisticasComponent } from './componentes/estadisticas/estadisticas.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CatalogoExternoComponent } from './componentes/catalogo-externo/catalogo-externo.component';
import { ArticuloDetalleModalComponent } from './componentes/articulo-detalle-modal/articulo-detalle-modal.component';
import { HelpModalComponent } from './componentes/help-modal/help-modal.component';
import { ActivityLogComponent } from './componentes/activity-log/activity-log.component';
import { SugerenciasIaModalComponent } from './componentes/sugerencias-ia-modal/sugerencias-ia-modal.component';
import {CommonModule} from '@angular/common';



// Función necesaria para compilar la traducción (AOT)
export function HttpLoaderFactory(http: any) {
  // @ts-ignore
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


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
    VentasCanceladasComponent,
    CatalogoExternoComponent,
    ArticuloDetalleModalComponent,
    HelpModalComponent,
    ActivityLogComponent,
    SugerenciasIaModalComponent


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    EstadisticasComponent,
    BrowserAnimationsModule,
    NgxChartsModule,
    CommonModule,
    HttpClientModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),



  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
