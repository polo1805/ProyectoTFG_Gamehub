import { Component } from '@angular/core';
import { FormControl, FormGroup  , FormBuilder , Validators} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroJuego } from '../../../shared/juegoData';
import { Request } from '../../../core/request.service';
import { LoadingComponent } from '../../../services/loading/loading.component';
import { CommonModule } from '@angular/common';
import { KeyService } from '../../../core/keys.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-registrar-juegos',
  standalone: true,
  templateUrl: './registrar-juegos.component.html',
  styleUrl: './registrar-juegos.component.css',
  imports: [ReactiveFormsModule, LoadingComponent , CommonModule ]
})
export class RegistrarJuegosComponent {
  formularioRegistroJuego : FormGroup ;
  registradoExito : boolean | null = null; 
  isLoading : boolean = false;
  esInvalido : boolean | null = null; 
  archivoSeleccionado : never[] = [];
  constructor(
    private request : Request , 
    private fb : FormBuilder , 
    private key : KeyService , 
    private cookieService : CookieService, 
    private router : Router , 
  ){
    this.formularioRegistroJuego = this.fb.group({
      nombreJuego: ['', Validators.required],
      descripcionJuego: ['', Validators.required],
      portadaJuego: ['', Validators.required],
      fechaLanzamientoJuego: ['', Validators.required],
      generoJuego: ['', Validators.required]
    })
  }
  onFileChange(event : any){
    const input = event.target ; 
    if(input.files.length > 1){
      alert('Solo puedes subir 1 imagene');
      input.value = '';
    }else{
      this.archivoSeleccionado =  Array.from(input.files);
      console.log(this.archivoSeleccionado);
    }
  }
  registrarJuego(){
    if(this.formularioRegistroJuego.invalid){
      console.log('Formulario Invalido');
      this.esInvalido = true; 
      return; 
    }
    this.esInvalido = false; 
    this.isLoading = true;
    console.log(this.formularioRegistroJuego.value);
    //Creamos el FormData y añadimos los paramentros 
    const formData = new FormData();
    formData.append('IMAGEN' , this.archivoSeleccionado[0])
    formData.append('NOMBRE' , this.formularioRegistroJuego.value.nombreJuego);
    formData.append('DESCRIPCION' , this.formularioRegistroJuego.value.descripcionJuego);
    formData.append('FECHA' , this.formularioRegistroJuego.value.fechaLanzamientoJuego);
    formData.append('GENERO' , this.formularioRegistroJuego.value.generoJuego);
    //Request a la API , enviandole el formData
    this.request.registroJuego(formData).subscribe({
      next: (respuesta) =>{
        console.log(respuesta);
        this.registradoExito = true;
        this.formularioRegistroJuego.reset();
      },
      error: (error) =>{
        this.isLoading = false 
        console.log(error);
        this.registradoExito = false;
      },
      complete:()=>{
        this.isLoading = false ; 
        console.log('Request registro juego completado');
      }
    })
  }
  cerrarSesion(){
    this.key.cerrarSesion();
    this.cookieService.delete('KEY');
    this.router.navigate(['/login']);
  }
}
