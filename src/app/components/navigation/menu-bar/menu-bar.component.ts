import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  imports: [],
  templateUrl: './menu-bar.component.html',
  standalone: true,
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {

  @Input({required: true}) isLoggedIn!: boolean;
  @Input({required: true}) isDoctor!: boolean;


}
