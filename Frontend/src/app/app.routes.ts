import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { VerificacionComponent } from './features/auth/verificacion/verificacion.component';
import { HomeComponent } from './features/inicio/home/home.component';
import { PerfilComponent } from './features/inicio/perfil/perfil.component';
import { BuscarJuegosComponent } from './features/inicio/buscar-juegos/buscar-juegos.component';
import { BuscarUsuariosComponent } from './features/inicio/buscar-usuarios/buscar-usuarios.component';
import { RegistrarJuegosComponent } from './features/admin/registrar-juegos/registrar-juegos.component';
import { HomeAdminComponent } from './features/admin/home-admin/home-admin.component';
import { JuegoComponent } from './features/inicio/juego/juego.component';
import { PostearComponent } from './features/inicio/postear/postear.component';
import { PostComponent } from './features/inicio/post/post.component';
import { EditarPerfilComponent } from './features/inicio/editar-perfil/editar-perfil.component';
import { SettingsComponent } from './features/inicio/settings/settings.component';
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
        path : 'settings' , 
        component : SettingsComponent
    },
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
        path:'admin' , 
        component: HomeAdminComponent
    },
    {
        path:'registrar-juegos' , 
        component: RegistrarJuegosComponent
    },
    {
        path:'post/:id',
        component : PostComponent
    },
    {
        path:'juegos/:id/postear' , 
        component: PostearComponent
    },
    {
        path:'juegos/:id',
        component:JuegoComponent 
    },
    {
        path: ':username' , 
        component:PerfilComponent
    } ,
    {
        path:':username/editar' , 
        component:EditarPerfilComponent
    },
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
