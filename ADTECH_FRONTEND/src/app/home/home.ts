import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from "../menu/menu";
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-home',
  imports: [
    Menu,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(private router: Router) {}

  logout(): void {
    console.log('Logout clicked');
    // Limpar token/sessão do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.clear(); // Limpar tudo para garantir
    // Redirecionar para login
    this.router.navigate(['/login']).then(() => {
      console.log('Navegado para login');
    });
  }
}
