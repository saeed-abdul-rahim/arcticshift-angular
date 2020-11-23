import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { shopProductRoute } from '@constants/routes';
import { ProductInterface } from '@models/Product';
import { SaleDiscountInterface } from '@models/SaleDiscount';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  @Input() products: ProductInterface[] | ProductInterface & SaleDiscountInterface[] = [];
  @Input() paginate = false;
  @Input() done = false;
  @Input() loading = false;
  @Input() showEmptyLabel = true;

  @Output() moreProducts = new EventEmitter<any>();

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  trackByFn(index: number, item: ProductInterface) {
    return item.id;
  }

  navigateToVariant(title: string, id: string) {
    const routeTitle = encodeURIComponent(title.split(' ').join('-'));
    this.router.navigateByUrl(`${shopProductRoute}/${routeTitle}/${id}`);
  }

}
