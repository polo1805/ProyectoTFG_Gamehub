import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router} from '@angular/router';
import { Registro } from '../../../shared/registroData';
import { Request } from '../../../core/request.service';
import { LoadingComponent } from '../../../services/loading/loading.component';
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, LoadingComponent] ,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  constructor(
    private request : Request ,
    private router : Router
  ){}
  nombre : string = '';
  nombreValidado : boolean = true;
  email : string =  '';
  emailValidado : boolean  = true ; 
  emailPattern : RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emailError : string = "Por favor , introduce un correo electronico valido"
  username : string = '';
  usernameValidado : boolean = true ; 
  password : string = '';
  passwordValidada : boolean = true ; 
  passwordPattern : RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d].{8,16}$/;
  passwordError : string = "Por favor , introduce una contraseña valida"
  passwordVisible : boolean = false ; 
  isLoading : boolean = false ; 
  mensajeError : string = '';

  cambiarVisibilidad(){
    this.passwordVisible = !this.passwordVisible;
  }
  clickRegistro(){
    if(this.nombre == ''){
      this.nombreValidado = false ; 
    }else{
      this.nombreValidado = true ; 
    }
    if(this.email == ''){
      this.emailValidado = false ;
      this.emailError =  "Por favor , introduce un correo electronico valido"
    }else if(!this.emailPattern.test(this.email)){
      this.emailValidado = false ;
      this.emailError = "Correo electronico incorrecto , comprueba que sigue el siguiente patron : example@gamehub.com"
    }else{
      this.emailValidado = true; 
    }
    if(this.username == ''){
      this.usernameValidado = false ; 
    }else{
      this.usernameValidado = true ; 
    }
    if(this.password == ''){
      this.passwordValidada = false ; 
    }else if(!this.passwordPattern.test(this.password)){
      this.passwordValidada = false ; 
      this.passwordError = `La contraseña debe de contener : 
      <ul>
        <li>Al menos una letra minuscula</li>
        <li>Al menos una letra mayuscula</li>
        <li>Al menos un numero</li>
        <li>Una longitud de al menos entre 8 y 16 caracteres</li>
      </ul>`
    }else{
      this.passwordValidada = true ; 
    }
    if(this.nombreValidado && this.emailValidado && this.usernameValidado && this.passwordValidada){
      this.isLoading = true ; 
      console.log('OK');
      let nuevoRegistro = new Registro(this.nombre , this.email , this.username , this.password);
      this.request.registrarUsuario(nuevoRegistro).subscribe({
        next : (datos) =>{
          console.log(datos);
          this.router.navigate(['/verificacion'] , {
            queryParams:{email: this.email}
          });
          this.isLoading = false;
        } , 
        error : (error) =>{
          console.error(error);
          this.mensajeError = error.error.message;
          this.isLoading = false;
        } , 
        complete : ()=>{
          console.log('Request completada')
        },
      });
      
    }
  }
}
