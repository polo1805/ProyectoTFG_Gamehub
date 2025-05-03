import { Component } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";
import { CommonModule, Location } from '@angular/common';
import { Request } from '../../../core/request.service';
import { ActivatedRoute } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from "../../../services/loading/loading.component";
import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [SideNavbarComponent, CommonModule, FormsModule, LoadingComponent],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.css'
})
export class EditarPerfilComponent {
  constructor(
    private location: Location,
    private request : Request , 
    private route : ActivatedRoute
  ){}
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  perfilCargado : any = {};
  username : string = "";
  imagenPerfil : string = "";
  nombrePerfil : string = "";
  usernamePerfil : string = "";
  biografiaPerfil : string = "";
  change : boolean = false;
  archivoSeleccionado : File | null = null;
  imagenTemporal : string | null = null;
  cargando : boolean = false;
  stateToast : string = '';
  iconToast : string = '';
  mensajeToast : string = '';
  ngOnInit(){
    this.cargarPagina()
  }
  //METODO QUE SE ENCARGAR DE LLAMAR A LOS METODOS QUE CARGAN LA INFORMACION DE LA PAGINA
  async cargarPagina(){
    this.cargando = true;
    await this.getUsernameURL();
    await this.cargarPerfil();
    this.cargando = false;
  }
  //METODO QUE SIMULA UN CLICK EN EL INPUT FILE PARA ABRIR EL SELECTOR DE ARCHIVOS
  abrirSelectorArchivo() {
    this.fileInputRef.nativeElement.click();
  }
  //METODO PARA OBTENER EL USERNAME SOLICITADO EN LA URL 
  getUsernameURL() : Promise<void>{
    return new Promise((resolve ,reject)=>{
      this.route.params.subscribe(params=>{
        this.username = params['username'];
        resolve()
      })
    })
  }  
  //METODO PARA CARGAR EL PERFIL
  cargarPerfil() : Promise<void>{
    return new Promise((resolve , reject)=>{
      this.request.getPerfil().subscribe({
        next : (response)=>{
          this.perfilCargado = response.message;
          this.imagenPerfil = this.perfilCargado.IMAGEN;
          this.nombrePerfil = this.perfilCargado.NOMBRE;
          this.usernamePerfil = this.perfilCargado.NOMBRE_USUARIO;
          this.biografiaPerfil = this.perfilCargado.BIOGRAFIA;
          console.log(this.perfilCargado);
          resolve()
        }, 
        error : (error)=>{
          console.log(error);
          reject(error);
        }
      })
    })
  }  
  /*
  * * EVENTOS CLICKS
  */
  //METODO PARA GUARDAR LOS CAMBIOS REALIZADOS EN EL PERFIL
  guardarCambios(){
    const formData = new FormData();
    formData.append('nombre' , this.nombrePerfil);
    formData.append('username' , this.usernamePerfil);
    formData.append('biografia' , this.biografiaPerfil);
    let idUsuario = this.perfilCargado.ID_USUARIO;
    formData.append('id_usuario' , idUsuario);
    if(this.archivoSeleccionado){
      formData.append('imagen' , this.archivoSeleccionado);
    }
    this.request.editarPerfil(formData).subscribe({
      next : async (response)=>{
        console.log(response);
        await this.cargarPerfil();
        this.change = false;
        this.imagenTemporal = null;
        this.archivoSeleccionado = null;
        this.mostrarToast(true , response.message);
      }, 
      error : (error)=>{
        console.log(error);
      }
    })
  }
  //METODO PARA VOLVER ATRAS 
  volverAtras(){
    this.location.back();
  }
  //METODO PARA DESHACER LOS CAMBIOS REALIZADOS EN EL PERFIL
  deshacerCambios(){
    this.cargarPerfil();
  }
  /*
  * * EVENTOS CHANGE
  */
  onFileSelected(event : any){
    this.change=true;
    const input = event.target as HTMLInputElement;
    if(input.files && input.files[0]){
      this.archivoSeleccionado = input.files[0];
      this.imagenTemporal = URL.createObjectURL(this.archivoSeleccionado)
    }
  }
  cambios(){
    this.change = true;
  }
  /* 
    * * FUNCIONES TOAST Y OTROS
    */
   //EVENTO PARA MOSTRAR EL TOAST , LE PASAMOS POR PARAMETRO UN BOOLEANO Y EL MENSAJE
    mostrarToast(success : boolean , mensaje:string ){
      if(success){
        this.stateToast = 'success'
        this.iconToast = 'check'
        this.mensajeToast = mensaje;
      }else{
        this.stateToast = 'danger'
        this.iconToast = 'x';
        this.mensajeToast = mensaje;
      }
      const toastLive = document.getElementById('liveToast');
      if (toastLive) {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
        toastBootstrap.show();
      }
    }
}
