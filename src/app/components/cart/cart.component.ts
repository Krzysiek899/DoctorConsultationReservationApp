import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Consultation} from '../../models/consultation.model';
import {CartService} from '../../services/cart/cart.service';
import {DatabaseFireService} from '../../services/database/fire/database-fire.service';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  standalone: true,
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    AsyncPipe
  ],
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Consultation[] = [];
  totalCost: number = 0;
  pricePer30Min: number = 50;

  constructor(private snackBar: MatSnackBar, private databaseService: DatabaseFireService, private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.calculateTotalCost();
    });
  }

  removeFromCart(itemId?: string) {
    this.cartService.removeFromCart(itemId);
    this.snackBar.open('Konsultacja usunięta z koszyka', 'Zamknij', { duration: 2000 });
  }

  calculateTotalCost() {
    this.totalCost = this.cart.reduce((sum, item) => {
      const duration = (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / (1000 * 60);
      return sum + (Math.ceil(duration / 30) * this.pricePer30Min);
    }, 0);
  }


  onSubmit() {
    if (this.cart.length > 0) {
      Promise.all(this.cart.map(consultation => this.databaseService.addConsultation(consultation)))
        .then(() => {
          this.snackBar.open('Konsultacje zostały pomyślnie dodane!', 'OK', { duration: 3000 });
          this.cartService.clearCart();
          this.totalCost = 0;
          this.router.navigateByUrl('mycalendar');
        })
        .catch(error => {
          console.error('Błąd podczas dodawania konsultacji:', error);
        });
    } else {
      this.snackBar.open('Koszyk jest pusty!', 'Zamknij', { duration: 3000 });
    }
  }
}
