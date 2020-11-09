import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgOtpInputModule } from 'ng-otp-input';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgSelectModule } from '@ng-select/ng-select';
import { SidebarModule } from 'ng-sidebar';

import { ComponentsModule } from '@components/components.module';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './shop.component';
import { HomeComponent } from './home/home.component';
import { ShopComponentsModule } from './shop-components/shop-components.module';
import { NavbarComponent } from './navbar/navbar.component';
import { ProductListComponent } from './product-list/product-list.component';
import { FilterProductComponent } from './filter-product/filter-product.component';
import { ProductService } from '@services/product/product.service';
import { VariantComponent } from './variant/variant.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderStatusComponent } from './order-status/order-status.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { CategoryComponent } from './category/category.component';
import { CollectionComponent } from './collection/collection.component';
import { CartService } from '@services/cart/cart.service';
import { CartTotalComponent } from './cart-total/cart-total.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { NavbarService } from '@services/navbar/navbar.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ModalService } from '@services/modal/modal.service';


@NgModule({
  declarations: [
    ShopComponent,
    HomeComponent,
    NavbarComponent,
    ProductListComponent,
    FilterProductComponent,
    VariantComponent,
    CartComponent,
    WishlistComponent,
    CheckoutComponent,
    OrderStatusComponent,
    OrdersComponent,
    ProfileComponent,
    CategoryComponent,
    CollectionComponent,
    CartTotalComponent,
    SignInComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShopRoutingModule,
    ComponentsModule,
    ShopComponentsModule,
    FontAwesomeModule,
    NgOtpInputModule,
    IvyCarouselModule,
    NgxImageZoomModule,
    NgSelectModule,
    SidebarModule.forRoot()
  ],
  providers: [
    NavbarService,
    ModalService,
    CartService,
    ProductService,
  ]
})
export class ShopModule { }
