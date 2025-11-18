import { Component } from '@angular/core';
import { Menu } from "../menu/menu";
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { Calendar } from "../calendar/calendar";

@Component({
  selector: 'app-dashboard',
  imports: [
    Menu,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    Calendar
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',

})
export class Dashboard{

}
