import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SideNavbarComponent ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
  temaActual : string = '';
  ngOnInit(){
    const outlet = document.querySelector('router-outlet');
    if(outlet){
      const tema = outlet.getAttribute('body');
      this.temaActual = (tema === 'light' || tema === 'dark') ? tema : 'dark';
      localStorage.setItem('tema' , this.temaActual);
    }
  }
  cambiarTema(event : Event){
    const valor = (event.target as HTMLSelectElement).value;
    const outlet = document.querySelector('body');
    console.log(valor)
    if(outlet){
      outlet.setAttribute('data-bs-theme', valor);
      localStorage.setItem('tema' , valor);
    }
  }
}
