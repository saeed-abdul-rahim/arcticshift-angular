import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';

import { OrderInterface } from '@models/Order';
import { User } from '@models/User';
import { ShopService } from '../shop/shop.service';
import { AuthService } from '../auth/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { VariantInterface } from '@models/Variant';
import { AlertService } from '@services/alert/alert.service';

@Injectable()
export class CartService {

  private user: User;
  private draftLoading = new BehaviorSubject<boolean>(false);
  private draft = new BehaviorSubject<OrderInterface>(null);
  private draftProductsLoading = new BehaviorSubject<boolean>(false);
  private draftProducts = new BehaviorSubject<{ draft: OrderInterface, variants: VariantInterface[] }>(null);
  private draftSubscription: Subscription;
  private draftProductsSubscription: Subscription;

  draft$ = this.draft.asObservable();
  draftLoading$ = this.draftLoading.asObservable();
  draftProducts$ = this.draftProducts.asObservable();
  draftProductsLoading$ = this.draftProductsLoading.asObservable();

  constructor(private shop: ShopService, private auth: AuthService, private alert: AlertService) {
    this.getCurrentUser();
  }

  destroy() {
    this.unsubscribeDrafts();
    this.unsubscribeDraftProducts();
  }

  unsubscribeDrafts() {
    if (this.draftSubscription && !this.draftSubscription.closed) {
      this.draftSubscription.unsubscribe();
    }
  }

  unsubscribeDraftProducts() {
    if (this.draftProductsSubscription && !this.draftProductsSubscription.closed) {
      this.draftProductsSubscription.unsubscribe();
    }
  }

  getDraft() {
    return this.draft$;
  }

  getDraftLoading() {
    return this.draftLoading$;
  }

  getProductsLoading() {
    return this.draftProductsLoading$;
  }

  getDraftOrdersDb() {
    this.setDraftLoading(true);
    this.unsubscribeDrafts();
    const { uid } = this.user;
    this.draftSubscription = this.shop.getDraftOrderByUserId(uid).subscribe(order => {
      this.setDraftLoading(false);
      if (order && order.length > 0) {
        this.draft.next(order[0]);
      }
    }, err => {
      this.setDraftLoading(false);
      this.handleError(err);
    });
  }

  getProductsFromDraft() {
    if (!this.draftProductsSubscription || this.draftProductsSubscription.closed) {
      this.setDraftProductsLoading(true);
      this.unsubscribeDraftProducts();
      this.draftProductsSubscription = this.getDraft().pipe(
        switchMap(draft => {
          if (!draft) { return of(null); }
          const { variants } = draft;
          const variantIds = draft.variants.map(variant => variant.variantId);
          return this.shop.getVariantByIds(variantIds).pipe(
            map(variantsData => {
              // Set Draft Quantity to Variant
              variantsData = variantsData.map(v => {
                const variantQuantity = variants.find(vq => vq.variantId === v.id);
                v.quantity = variantQuantity.quantity;
                return v;
              });
              return { draft, variants: variantsData };
            })
          );
        })
      ).subscribe(
        draftVariants => {
          this.setDraftProductsLoading(false);
          this.draftProducts.next(draftVariants);
        },
        err => {
          this.setDraftProductsLoading(false);
          this.handleError(err);
        });
    }
    return this.draftProducts$;
  }

  private getCurrentUser() {
    this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
        this.user = user;
        this.getDraftOrdersDb();
      }
    });
  }

  private setDraftLoading(loading: boolean) {
    this.draftLoading.next(loading);
  }

  private setDraftProductsLoading(loading: boolean) {
    this.draftProductsLoading.next(loading);
  }

  private handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
