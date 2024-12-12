import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders  } from "@angular/common/http";
import { Usuario } from "../shared/usuarioData";
import { Observable } from "rxjs";
import { NgModule } from "@angular/core";
import { Registro } from "../shared/registroData";

@Injectable({
    providedIn: 'root',
})
export class Request{
    private baseUrl = 'http://localhost:80/';
    constructor(
        private http:HttpClient
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
}