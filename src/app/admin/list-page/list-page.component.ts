import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { Condition } from '@models/Common';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css']
})
export class ListPageComponent implements OnInit, OnDestroy {

  loading: boolean;
  shopId: string;
  heading: string;
  label: string;
  urlSplit: string[];
  data: any[];

  userSubscription: Subscription;
  dataSubscription: Subscription;

  displayedColumns: string[];
  dataKeys: string[];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private authService: AuthService,
              private cdr: ChangeDetectorRef, private page: PaginationService) { }

  ngOnInit(): void {
    this.unsubscribeUser();
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => {
      if (user && user.shopId) {
        this.shopId = user.shopId;
        const url = this.router.url;
        this.urlSplit = url.split('/');
        this.switchNavItems(this.urlSplit);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeData();
    this.unsubscribeUser();
  }

  unsubscribeData() {
    if (this.dataSubscription && !this.dataSubscription.closed) { this.dataSubscription.unsubscribe(); }
  }

  unsubscribeUser() {
    if (this.userSubscription && !this.userSubscription.closed) { this.userSubscription.unsubscribe(); }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  switchNavItems(urlSplit: string[]) {

    this.unsubscribeData();
    const { db } = environment;
    const {
      products,
      productTypes,
      attributes,
      collections,
      categories,
      users,
      saleDiscounts,
      vouchers,
      shipping,
      warehouse,
      orders,
    } = db;

    if (urlSplit.includes('product')) {

      this.heading = 'Products';
      this.label = 'Product';
      this.getData(products, {
        name: 'Name',
        price: 'Price'
      });

    } else if (urlSplit.includes('collection')) {

      this.heading = 'Collections';
      this.label = 'Collection';
      this.getData(collections, {
        name: 'Name',
        productId: 'No. of products',
        status: 'Status'
      });

    } else if (urlSplit.includes('category')) {

      this.heading = 'Categories';
      this.label = 'Category';
      this.getData(categories, {
        name: 'Name',
        subCategoryId: 'Subcategories',
        productId: 'No. of products'
      });

    } else if (urlSplit.includes('product-type')) {

      this.heading = 'Product Types';
      this.label = 'Product Type';
      this.getData(productTypes, {
        name: 'Name'
      });

    } else if (urlSplit.includes('attribute')) {

      this.heading = 'Attributes';
      this.label = 'Attribute';
      this.getData(attributes, {
        name: 'Name',
        code: 'Code',
        status: 'Status'
      });

    } else if (urlSplit.includes('sales')) {

      this.heading = 'Sale Discounts';
      this.label = 'Sale Discount';
      this.getData(saleDiscounts, {
        name: 'Name',
        code: 'Code',
        value: 'Value',
        status: 'Status'
      });

    } else if (urlSplit.includes('vouchers')) {

      this.heading = 'Vouchers';
      this.label = 'Voucher';
      this.getData(vouchers, {
        code: 'Code',
        value: 'Value',
        status: 'Status'
      });

    } else if (urlSplit.includes('shipping')) {

      this.heading = 'Shipping';
      this.label = 'Shipping';
      this.getData(shipping, {
        name: 'Name',
        countries: 'Countries',
      });

    } else if (urlSplit.includes('warehouse')) {

      this.heading = 'Warehouse';
      this.label = 'Warehouse';
      this.getData(warehouse, {
        name: 'Name',
        shippingId: 'Shipping Zones',
      });

    } else if (urlSplit.includes('orders')) {

      this.heading = 'Orders';
      this.label = '';
      this.getData(orders, {
        orderNo: 'Order No.',
        customerName: 'Customer Name',
        orderStatus: 'Order Status',
        orderId: 'No. of Orders',
        total: 'Total'
      });

    } else if (urlSplit.includes('users')) {

      this.heading = 'Users';
      this.label = '';
      this.getData(users, {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        orderId: 'No. of Orders'
      });

    } else if (urlSplit.includes('staff')) {

      this.heading = 'Staff';
      this.label = '';
      this.getData(users, {
        name: 'Name',
        email: 'Email',
      }, [{
        field: 'shopId',
        type: 'array-contains',
        value: this.shopId
      }]);

    }

  }

  getData(path: string, displayData: any, where?: Condition[]) {
    this.loading = true;
    this.displayedColumns = [];
    this.dataKeys = [];
    this.page.init(path, {
      field: 'createdAt',
      reverse: true,
      where: [{ field: 'shopId', type: '==', value: this.shopId }, ...where],
      limit: 2
    });
    Object.entries(displayData).forEach(([k, v]) => {
      this.dataKeys.push(k);
      this.displayedColumns.push(v as string);
    });
    this.dataSubscription = this.page.data.subscribe(data => {
      this.data = data;
      if (data && data.length > 0) {
        this.fillTable(data);
      }
      this.loading = false;
    });
  }

  fillTable(data: any[]) {
    try {
      this.dataSource = new MatTableDataSource(data);
      this.cdr.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (err) { }
  }

  getValue(data: string | number | any[]) {
    if (Array.isArray(data)) {
      return data.length;
    } else {
      return data;
    }
  }

}
