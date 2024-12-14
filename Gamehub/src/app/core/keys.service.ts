import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class KeyService{
    public USERNAME : string  = ""; 
    public TOKEN : string = ""; 
    constructor(){}
}