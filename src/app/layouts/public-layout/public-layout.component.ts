import { Component } from '@angular/core';
import {MenuBarComponent} from '../../components/navigation/menu-bar/menu-bar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [
    MenuBarComponent,
    RouterOutlet
  ],
  templateUrl: './public-layout.component.html',
  standalone: true,
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {

}
