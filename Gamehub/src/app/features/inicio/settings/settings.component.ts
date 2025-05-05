import { Component } from '@angular/core';
import { SideNavbarComponent } from "../../../services/side-navbar/side-navbar.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SideNavbarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

}
