import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Request } from '../../../core/request.service';
import { LoadingComponent } from '../../../services/loading/loading.component';
@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './verificacion.component.html',
  styleUrl: './verificacion.component.css'
})
export class VerificacionComponent implements OnInit{
  constructor(
    private route : ActivatedRoute , 
    private request : Request , 
    private router : Router , 
  ){}
  codigoValidado : boolean = true ; 
  codigo : string = '';
  codigoPattern : RegExp = /^\d{6}$/
  emailRecibido : string = '';
  isLoading : boolean = false ; 
  mensajeError : string = '';
  ngOnInit(): void {
    this.route.queryParams.subscribe((params)=>{
      this.emailRecibido = params['email']
    })
  }
  clickVerificacion(){
    if(this.codigo == ''){
      this.codigoValidado = false;
    }else{
      this.codigoValidado = true
    }

    if(!this.codigoPattern.test(this.codigo)){
      this.codigoValidado =  false;
    }else{
      this.codigoValidado = true ;
    }

    if(this.codigoValidado){
      this.isLoading = true ; 
      this.request.validarCodigo(this.emailRecibido , this.codigo).subscribe({
        next : (datos)=>{
          console.log(datos);
          if(datos.status == 200){
            this.router.navigate(['/login'])
          }
        } , 
        error : (error)=>{
          console.log(error.error);
          this.mensajeError = error.error.message
          this.isLoading = false; 
        } , 
        complete : ()=>{
          this.isLoading = false; 

        }
      })
    }
  }
}
