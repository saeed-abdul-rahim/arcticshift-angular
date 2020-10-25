import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';

import { OrderInterface } from '@models/Order';
import { User } from '@models/User';
import { ShopService } from '../shop/shop.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CartService {

  private user: User;
  private draft = new BehaviorSubject<OrderInterface>(null);
  private draftSubscription: Subscription;

  draft$ = this.draft.asObservable();

  constructor(private shop: ShopService, private auth: AuthService) {
    this.getCurrentUser();
  }

  destroy() {
    this.unsubscribeDrafts();
  }

  unsubscribeDrafts() {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
  }

  getDraft() {
    return this.draft$;
  }

  getDraftOrdersDb() {
    this.unsubscribeDrafts();
    const { uid } = this.user;
    this.draftSubscription = this.shop.getDraftOrderByUserId(uid).subscribe(order => {
      if (order && order.length > 0) {
        this.draft.next(order[0]);
      }
    });
  }

  getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
        this.user = user;
        this.getDraftOrdersDb();
      }
    });
  }

}
