import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders  } from "@angular/common/http";
import { Usuario } from "../shared/usuarioData";
import { Observable } from "rxjs";
import { NgModule } from "@angular/core";
import { Registro } from "../shared/registroData";
import { CookieService } from "ngx-cookie-service";
import { RegistroJuego } from "../shared/juegoData";
@Injectable({
    providedIn: 'root',
})
export class Request{
    private baseUrl = 'http://localhost:80/';
    constructor(
        private http:HttpClient , 
        private cookies : CookieService
    ){}


    comprobarUsuario(usuario : Usuario):Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json'})
        return this.http.post<any>(`${this.baseUrl}comprobarUsuario` , usuario , {headers})
    }
    registrarUsuario(nuevoRegistro : Registro): Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json'});
        return this.http.post<any>(`${this.baseUrl}registrarUsuario` , JSON.stringify(nuevoRegistro) , {headers})
    }
    validarCodigo(email : string , codigo : string ): Observable <any>{
        let dataValidacion = { //Hacemos un JSON con los datos que se pasan por parametros ya que esta vez no recibimos un objeto
            EMAIL : email , 
            CODIGO : codigo ,
        }
        const headers = new HttpHeaders({'Content-Type' : 'application/json'});
        return this.http.post<any>(`${this.baseUrl}validarCodigo` , dataValidacion , {headers})
    }
    getPerfil(username ?: string | null ) : Observable <any>{
        let json
        if(username){
             json = {USERNAME : username}
        }else{
             json = {};
        }
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')});
        return this.http.post<any>(`${this.baseUrl}getPerfil` , json ,  {headers})
    }
    buscarUsuarios(input : string) : Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')});
        return this.http.post<any>(`${this.baseUrl}buscarUsuarios` , {INPUT : input} , {headers})
    }
    registroJuego( formData : FormData) : Observable <any>{
        const headers = new HttpHeaders({'Authorization' : "Bearer "+this.cookies.get('KEY')});
        return this.http.post<any>(`${this.baseUrl}registrarJuego` , formData , {headers})
    }
    buscarJuegos(input : string) : Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')});
        return this.http.post<any>(`${this.baseUrl}buscarJuegos` , {INPUT : input} , {headers});
    }
    verJuego(id : string | null):Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')});
        return this.http.post<any>(`${this.baseUrl}verJuegos` , {ID : id} , {headers})
    }
    subirPost(formData : FormData){
        const headers = new HttpHeaders({'Authorization' : "Bearer "+this.cookies.get('KEY')})
        return this.http.post<any>(`${this.baseUrl}subirPost` , formData, {headers})
    }
    getPostPerfil(idUsuario : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}getPostsPerfil` , {ID_USUARIO : idUsuario} , {headers})
    }
    anadirLike(idUsuario : string , idPost : string ) :Observable <any>{
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}anadirLike` , {ID_USUARIO : idUsuario , ID_POST : idPost} , {headers})
    }
    eliminarLike(idUsuario : string , idPost : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}eliminarLike` , {ID_USUARIO : idUsuario , ID_POST : idPost} , {headers})
    }
    getLikes(idUsuario : string , idPost : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}getLikes` , {ID_USUARIO : idUsuario , ID_POST : idPost} , {headers})
    }
    anadirComentario(idUsuario : string , idPost:string , comentario : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}anadirComentario` , {ID_USUARIO : idUsuario , ID_POST : idPost , COMENTARIO : comentario} , {headers})
    }
    getNumeroComentarios(idPost : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}getNumeroComentarios` , {ID_POST : idPost} , {headers})
    }
    eliminarPostPerfil(idPost : string ){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}eliminarPostPerfil` , {ID_POST : idPost} , {headers})
    }
    cargarPost(idPost : string | null){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}cargarPost` , {ID_POST : idPost} , {headers})
    }
    cargarComentarios(idPost : string | null){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}cargarComentarios` , {ID_POST : idPost} , {headers})
    }
    getUsuario(idUsuario : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}getUsuario` , {ID_USUARIO : idUsuario} , {headers})
    }
    cargarPostParaTi(){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}cargarPostParaTi` , {} , {headers})
    }
    eliminarComentario(idComentario : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}eliminarComentario` , {ID_COMENTARIO : idComentario} , {headers})
    }
    seguirUsuario(idUsuario : string , idSeguido : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}seguirUsuario` , {ID_USUARIO : idUsuario , ID_SEGUIDO : idSeguido} , {headers})
    }
    comprobarSeguimiento(idUsuario : string , idSeguido : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}comprobarSeguimiento` , {ID_USUARIO : idUsuario , ID_SEGUIDO : idSeguido} , {headers})
    }
    eliminarSeguimiento(idUsuario : string , idSeguido : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}eliminarSeguimiento` , {ID_USUARIO : idUsuario , ID_SEGUIDO : idSeguido} , {headers})
    }
    cargarPostsSiguiendo(idUsuario : string){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}cargarPostsSiguiendo` , {ID_USUARIO : idUsuario} , {headers})
    }
    getGeneroJuegos(){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}getGeneroJuegos` , {} , {headers})
    }
    filtrarJuegosPorGenero(generos : string[]){
        const headers = new HttpHeaders({'Content-Type' : 'application/json' , 'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}filtrarJuegosPorGenero` , {GENEROS : generos} , {headers})
    }
    cambiarDatosPerfil(formData : FormData){
        const headers = new HttpHeaders({'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}cambiarDatosPerfil` , formData , {headers})
    }
    editarPerfil(formData : FormData){
        const headers = new HttpHeaders({'Authorization' : "Bearer "+this.cookies.get('KEY')}); 
        return this.http.post<any>(`${this.baseUrl}editarPerfil` , formData , {headers})
    }
}