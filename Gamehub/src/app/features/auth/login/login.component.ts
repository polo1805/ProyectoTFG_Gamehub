import { Component, NgModule } from '@angular/core';
import { Usuario } from '../../../shared/usuarioData';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/request.service';
import { RouterModule } from '@angular/router';
import { KeyService } from '../../../core/keys.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule , ReactiveFormsModule , CommonModule , RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css', 
})


export class LoginComponent {
  constructor(
    public request : Request  , 
    public key: KeyService , 
  ){}
  //Propiedades de la clase LogIn
  password : string = '';
  usuario : string = '';
  passwordVisible = false
  usuarioValidado = true
  passwordValidada = true
  mensajeError : string = '';

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
      this.request.comprobarUsuario(usuario).subscribe({
        next : (res)=>{
          console.log(res);
          this.key.USERNAME = this.usuario; 
        },
        error : (error)=>{
          console.log(error);
          this.mensajeError = error.error.message ; 
        } , 
        complete : ()=>{
          
        }
      });
    }
    
    
  }
  
}

