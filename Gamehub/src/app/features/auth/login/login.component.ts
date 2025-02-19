import { Component } from '@angular/core';
import { Usuario } from '../../../shared/usuarioData';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/request.service';
import { Router } from '@angular/router';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { LoadingComponent } from '../../../services/loading/loading.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css', 
})


export class LoginComponent {
  constructor(
    public request : Request  , 
    public key: KeyService , 
    public router : Router , 
    private cookieService : CookieService
  ){}
  //Propiedades de la clase LogIn
  password : string = '';
  usuario : string = '';
  passwordVisible = false
  usuarioValidado = true
  passwordValidada = true
  mensajeError : string = '';
  isLoading : boolean = false
  cambiarVisibilidad(){
    this.passwordVisible = !this.passwordVisible
  }
  clickInicioSesion(){
    if(this.usuario == ''){
      this.usuarioValidado = false;
    }else{
      this.usuarioValidado = true ; 
    }
    if(this.password == ''){
      this.passwordValidada = false ; 
    }else{
      this.passwordValidada = true
    }
    if((this.passwordValidada && this.usuarioValidado) != false){
      let usuario = new Usuario(this.usuario , this.password)
      console.log(usuario);
      this.isLoading = true
      this.request.comprobarUsuario(usuario).subscribe({
        next : (res)=>{
          this.key.USERNAME = this.usuario; 
          this.key.TOKEN = res.token;
          this.cookieService.set('KEY' , this.key.TOKEN , 90 , '/' , undefined , true , 'Lax');
          this.request.getPerfil().subscribe({
            next: (response) => {
              if(response.message.ROL == 'ADMIN'){
                this.router.navigate(['/admin']);
              }else{
                this.router.navigate(['/home'])
              }
            }, 
            error: (error) => {
              console.log(error)
            } ,
            complete: () => {
              console.log('getPerfil completado')
            }
          })
        },
        error : (error)=>{
          console.log(error);
          this.mensajeError = error.error.message ; 
          this.isLoading = false
        } , 
        complete : ()=>{
          this.isLoading = false
        }
      });
    }
    
    
  }
  
}

