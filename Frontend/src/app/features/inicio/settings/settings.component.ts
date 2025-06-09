import { Component, OnInit } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SideNavbarComponent , FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
  temaActual : string = '';
  ngOnInit(){
    const outlet = document.querySelector('body');
    if(outlet){
      const tema = outlet.getAttribute('data-bs-theme');
      this.temaActual = (tema === 'light' || tema === 'dark') ? tema : 'dark';

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
