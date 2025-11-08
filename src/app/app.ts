// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import SidebarComponent from './shared/sidebar/sidebar.component'; // <-- Importa el nuevo sidebar

@Component({
  selector: 'app-root',
  standalone: true, // <-- Asegúrate que 'standalone' es true
  imports: [
    RouterOutlet,
    NavbarComponent,  // <-- El Navbar (superior) se queda
    SidebarComponent  // <-- Añade el Sidebar (lateral)
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'ControlAcceso';
  // Toda la lógica del menú que te di en la respuesta anterior se BORRA de aquí.
  // Ahora vive en sidebar.component.ts
}
