import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {Observable} from 'rxjs';
import {Router, RouterLink} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {MatAnchor} from '@angular/material/button';

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

  isLoggedIn$!: Observable<boolean>;
  userRole$!: Observable<string | null>;

  constructor(private authService: AuthService, private router: Router) {

  }

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userRole$ = this.authService.userRole$;
  }

  logout() {
    this.authService.logout().then(()=>{
      this.router.navigate(['/login']);}
    );
  }
}
