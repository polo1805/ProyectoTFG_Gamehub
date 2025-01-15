import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { VerificacionComponent } from './features/auth/verificacion/verificacion.component';
import { HomeComponent } from './features/inicio/home/home.component';
import { PerfilComponent } from './features/inicio/perfil/perfil.component';
import { BuscarJuegosComponent } from './features/inicio/buscar-juegos/buscar-juegos.component';
import { BuscarUsuariosComponent } from './features/inicio/buscar-usuarios/buscar-usuarios.component';
export const routes: Routes = [
    {
        path:'home' , 
        component : HomeComponent
    } , 
    {
        path:'login' , 
        component : LoginComponent 
    } ,
    {
        path : 'registro' ,
        component : RegistroComponent
    } , 
    {
        path : 'verificacion' , 
        component : VerificacionComponent
    } ,
    {
        path:'buscar-juegos' , 
        component : BuscarJuegosComponent
    } , 
    {
        path:'buscar-usuarios' , 
        component: BuscarUsuariosComponent
    },
    {
        path: ':username' , 
        component:PerfilComponent
    } ,
    {
        path:'' , 
        redirectTo:'/home',
        pathMatch:'full'
    } , 
    {
        path : '**' , 
        redirectTo : '/home'
    },

    
];
