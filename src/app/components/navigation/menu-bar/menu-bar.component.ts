import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {Observable} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {MatAnchor} from '@angular/material/button';
import {AuthFireService} from '../../../services/auth/fire/auth-fire.service';
import {UserwithRole} from '../../../models/user.model';

@Component({
  selector: 'app-menu-bar',
  imports: [
    RouterLink,
    AsyncPipe,
    MatAnchor
  ],
  templateUrl: './menu-bar.component.html',
  standalone: true,
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent implements OnInit {

  currentUser$!: Observable<UserwithRole | null>;


  constructor(private authService: AuthFireService, private router: Router) {

  }

  ngOnInit() {
    this.currentUser$ = this.authService.currentUser$;

  }

  logout() {
    this.authService.logout().subscribe({
      next: () => { this.router.navigateByUrl('/login');
        },
      error: (err) => {
        console.log(err)
      }
      }
    );
  }
}
