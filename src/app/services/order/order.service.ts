import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { map } from 'rxjs/internal/operators/map';

import { DbService } from '@services/db/db.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { AuthService } from '@services/auth/auth.service';
import { User } from '@models/User';
import { OrderInterface } from '@models/Order';

@Injectable()
export class OrderService {

  private user: User;

  private userSubscription: Subscription;

  constructor(private dbS: DbService, private page: PaginationService, private auth: AuthService) {
    this.getCurrentUser();
  }

  destroy() {
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  get orders() {
    const { user } = this;
    if (!user) {
      return;
    }
    const { dbOrdersRoute } = this.dbS;
    this.page.init(dbOrdersRoute, {
      where: [{
        field: 'userId', type: '==', value: user.uid
      }],
      orderBy: {
        field: 'createdAt', direction: 'desc'
      },
      limit: 10
    });
    return this.page.data.pipe(map((data: OrderInterface[]) => data));
  }

  more() {
    this.page.more();
  }

  get loading() {
    return this.page.loading;
  }

  get done() {
    return this.page.done;
  }

  private getCurrentUser() {
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => {
      this.user = user;
    });
  }
}
