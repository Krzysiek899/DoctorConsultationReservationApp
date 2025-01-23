import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Consultation} from '../../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Consultation[] = [];
  private cartSubject = new BehaviorSubject<Consultation[]>([]);

  cart$ = this.cartSubject.asObservable();

  addToCart(item: Consultation) {
    const newItem = {
      ...item,
      id: this.generateUniqueId()  // Generowanie własnego ID
    };

    this.cart.push(newItem);
    this.cartSubject.next(this.cart);
  }

  private generateUniqueId(): string {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }


  removeFromCart(itemId?: string) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.cartSubject.next(this.cart);
  }

  getCart() {
    return this.cart;
  }

  clearCart() {
    this.cart = [];
    this.cartSubject.next(this.cart);
  }
}
