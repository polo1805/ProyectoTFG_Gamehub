import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/request.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificarPublicacionService } from '../../../services/notificar-publicacion.service';
import { KeyService } from '../../../core/keys.service';
@Component({
  selector: 'app-postear',
  standalone: true,
  imports: [SideNavbarComponent , CommonModule , FormsModule],
  templateUrl: './postear.component.html',
  styleUrl: './postear.component.css'
})
export class PostearComponent implements OnInit{
  valoracion : number = 0;
  puntuacionSeleccionada : boolean = false;
  juegoID : string | null = '';
  datosJuego : any = {};
  archivosSeleccionados : never[] = [];
  descripcion : string = '';
  userID : string = '';
  constructor(
    private request : Request ,
    private route : ActivatedRoute , 
    private publicacionService : NotificarPublicacionService , 
    private router : Router , 
    private key : KeyService
  ){} 
  ngOnInit(): void {
    const barras = document.querySelectorAll('.barra');
    this.request.getPerfil().subscribe({
      next:(response)=>{
        console.log(response)
        this.userID= response.message.ID_USUARIO;
        this.key.USERNAME = response.message.NOMBRE_USUARIO;
      }
    })
    barras.forEach((barra , index)=>{
      barra.addEventListener('mouseover' , ()=>{
        this.resetBarras();
        this.valoracion = index
        if(!this.puntuacionSeleccionada){
          this.valoracion = index
        }
        for(let i = 0 ; i <= index ; i++){
          barras[i].classList.add('activo');
        }
        for(let i = index +1 ; i < barras.length ; i++){
          barras[i].classList.add('inactivo')
        }
      })
      barra.addEventListener('click' , ()=>{
        for(let i = 0 ; i <= index ; i++){
          this.valoracion = index;
          this.puntuacionSeleccionada = true; 
        }
      })
      barra.addEventListener('mouseout', () => {
        if(!this.puntuacionSeleccionada){
          this.valoracion = 0;
          this.resetBarras();
        }
        
      });
    });
    this.route.paramMap.subscribe(params=>{
      this.juegoID = params.get('id');
      console.log(this.juegoID)
    })
    this.request.verJuego(this.juegoID).subscribe({
      next : (res)=>{
        console.log(res.message);
        this.datosJuego = res.message
      }
    })

  }

  resetBarras(){
    const barras = document.querySelectorAll('.barra');
    barras.forEach(barra =>{
      barra.classList.remove('activo');
      barra.classList.remove('inactivo');
    })
  }

  onFileChange(event : any){
    const input = event.target ; 
    if(input.files.length > 4){
      alert('Solo puedes subir 4 imagenes');
      input.value = '';
    }else{
      this.archivosSeleccionados = Array.from(input.files);
    }
  }
  onSubmit(){
    if(this.archivosSeleccionados.length > 0 ){
      const formData = new FormData();
      this.archivosSeleccionados.forEach((file , index )=>{
        formData.append(`imagen[${index}]`, file)
      })
      formData.append('idUser' , this.userID)
      formData.append('idJuego' , this.juegoID ? this.juegoID.toString() : '');
      formData.append('valoracion' , this.valoracion.toString());
      formData.append('descripcion' , this.descripcion);
      this.request.subirPost(formData).subscribe({
        next:(response)=>{
          console.log(response)
          this.publicacionService.notificarPublicacion(true);
          this.router.navigate([`${this.key.USERNAME}`])
        },
        error:(response)=>{
          console.log(response);
          this.publicacionService.notificarPublicacion(false);
          this.router.navigate([`${this.key.USERNAME}`])

        }
      })
    }else{
      const formData = new FormData();
      formData.append('idUser' , this.userID)
      formData.append('idJuego' , this.juegoID ? this.juegoID.toString() : '');
      formData.append('valoracion' , this.valoracion.toString());
      formData.append('descripcion' , this.descripcion);
      this.request.subirPost(formData).subscribe({
        next:(response)=>{
          console.log(response);
          this.publicacionService.notificarPublicacion(true);
          this.router.navigate([`${this.key.USERNAME}`] , {
            state:{mensajeToast : 'Publicacion subida correctamente' , estado : 'success' , icon:'check'}
          })
        },
        error:(response)=>{
          console.log(response)
          this.publicacionService.notificarPublicacion(false);
          this.router.navigate([`${this.key.USERNAME}`] , {
            state : { mensajeToast : 'No se ha podido subir la publicacion' , estado : 'danger' , icon : 'x'}
          })
        }
      })
    }
  }
}
