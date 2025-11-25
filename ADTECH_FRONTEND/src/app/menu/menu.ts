import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu implements OnInit {
  homeRoute: string = '/home-cliente';

  ngOnInit() {
    const role = localStorage.getItem('role');
    if (role === 'cartorio') {
      this.homeRoute = '/home-cartorio';
    } else if (role === 'advogado') {
      this.homeRoute = '/home-advogado';
    } else {
      this.homeRoute = '/home-cliente';
    }
  }
}
