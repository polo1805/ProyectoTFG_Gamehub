import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet , 
    FormsModule , 
    CommonModule , 
    ReactiveFormsModule , 
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css' , 
})
export class AppComponent implements OnInit{
  title = 'Gamehub';
  ngOnInit(): void {
    const outlet = document.querySelector('body');
    if(outlet){
      outlet.setAttribute('data-bs-theme', localStorage.getItem('tema') || 'dark');
    }
  }
}
