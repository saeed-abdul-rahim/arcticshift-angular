import { Injectable, NgZone } from '@angular/core';
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
import { RazorpayOptions } from '@models/RazorpayOptions';
import { environment } from '@environment';
import { Router } from '@angular/router';

@Injectable()
export class CartService {

  private user: User;
  private draftLoading = new BehaviorSubject<boolean>(false);
  private draft = new BehaviorSubject<OrderInterface>(null);
  private draftProductsLoading = new BehaviorSubject<boolean>(false);
  private draftProducts = new BehaviorSubject<{ draft: OrderInterface, variants: VariantInterface[] }>(null);
  private shippingRateIds = new BehaviorSubject<string[]>([]);
  private isDeliverable = new BehaviorSubject<boolean>(false);
  private cod = new BehaviorSubject<boolean>(false);

  private draftSubscription: Subscription;
  private draftProductsSubscription: Subscription;
  private userSubscription: Subscription;

  draft$ = this.draft.asObservable();
  draftLoading$ = this.draftLoading.asObservable();
  draftProducts$ = this.draftProducts.asObservable();
  draftProductsLoading$ = this.draftProductsLoading.asObservable();
  shippingRateIds$ = this.shippingRateIds.asObservable();
  isDeliverable$ = this.isDeliverable.asObservable();
  cod$ = this.cod.asObservable();

  constructor(private shop: ShopService, private auth: AuthService, private alert: AlertService,
              private router: Router, private ngZone: NgZone) {
    this.getCurrentUser();
  }

  destroy() {
    this.unsubscribeDrafts();
    this.unsubscribeDraftProducts();
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
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

  getDraftProducts() {
    return this.draftProducts$;
  }

  getDraftLoading() {
    return this.draftLoading$;
  }

  getProductsLoading() {
    return this.draftProductsLoading$;
  }

  setShippingRateIds(ids: string[]) {
    this.shippingRateIds.next(ids);
  }

  getShippingRateIds() {
    return this.shippingRateIds$;
  }

  setIsDeliverable(isDeliverable: boolean) {
    this.isDeliverable.next(isDeliverable);
  }

  getIsDeliverable() {
    return this.isDeliverable$;
  }

  setCod(cod: boolean) {
    this.cod.next(cod);
  }

  getCod() {
    return this.cod$;
  }

  getDraftOrdersDb() {
    this.setDraftLoading(true);
    this.unsubscribeDrafts();
    const { uid } = this.user;
    this.draftSubscription = this.shop.getDraftOrderByUserId(uid).subscribe(order => {
      this.setDraftLoading(false);
      if (order && order.length > 0) {
        this.draft.next(order[0]);
      } else {
        this.draft.next(null);
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
          if (!draft || draft.variants.length === 0) { return of(null); }
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

  async unsetShipping() {
    if (this.draft.value && this.draft.value.shippingRateId) {
      try {
        const { orderId } = this.draft.value;
        await this.shop.updateCartShipping(orderId, { shippingRateId: '' });
      } catch (err) {}
    }
  }

  async pay(data: OrderInterface, email?: string, phone?: string) {
    try {
      if (!this.isDeliverable.value) {
        throw new Error('Not deliverable');
      }
      const shippingRateIds = this.shippingRateIds.value;
      const draft = this.draft.value;
      if (shippingRateIds.length > 0 && !draft.shippingRateId) {
        throw new Error('Select Shipping');
      }
      const cod = this.cod.value;
      if (cod) {
        await this.shop.finalizeCart({ ...data, cod });
        this.router.navigateByUrl('', { state: { orderCompleted: true } });
      } else {
        const gatewayOrderDetails = await this.shop.finalizeCart(data);
        const { amount, currency, id } = gatewayOrderDetails;
        const options: RazorpayOptions = {
          key: environment.razorPay.key,
          amount,
          currency,
          order_id: id,
          prefill: {
            contact: phone,
            email
          },
          handler: () => this.ngZone.run(() => this.router.navigateByUrl('', { state: { orderCompleted: true } }))
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      throw err;
    }
  }

  private getCurrentUser() {
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => {
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
    this.alert.alert({ message: err.message || err });
  }

}
