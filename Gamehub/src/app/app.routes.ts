import { Routes } from '@angular/router';
import path from 'path';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { VerificacionComponent } from './features/auth/verificacion/verificacion.component';

export const routes: Routes = [
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
        redirectTo:'/login',
        pathMatch:'full'
    } , 
    {
        path : '**' , 
        redirectTo : '/login'
    },

    
];
