import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { VerificacionComponent } from './features/auth/verificacion/verificacion.component';
import { HomeComponent } from './inicio/home/home.component';

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
        path:'' , 
        redirectTo:'/home',
        pathMatch:'full'
    } , 
    {
        path : '**' , 
        redirectTo : '/home'
    },

    
];
