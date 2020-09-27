import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { Condition } from '@models/Common';
import { AdminService } from '@services/admin/admin.service';

import {
  CATEGORY,
  COLLECTION,
  CUSTOMER,
  ORDER,
  PRODUCT,
  PRODUCTATTRIBUTE,
  PRODUCTTYPE,
  SALE,
  SHIPPING,
  STAFF,
  VOUCHER,
  WAREHOUSE
} from '@constants/adminRoutes';


@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css']
})
export class ListPageComponent implements OnInit, OnDestroy, AfterViewInit {

  loading: boolean;
  shopId: string;
  heading: string;
  label: string;
  urlSplit: string[];
  data: any[];
  resultLength = 0;
  dataLengthKey = 'totalDocs';

  userSubscription: Subscription;
  dataSubscription: Subscription;
  analyticsSubscription: Subscription;

  displayData: any[] = [];
  displayedColumns: string[];
  dataKeys: string[];
  dataSource: MatTableDataSource<any>;
  pageNo: number;
  pageSize = 30;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private router: Router, private authService: AuthService, private admin: AdminService,
              private cdr: ChangeDetectorRef, private page: PaginationService) { }

  ngOnInit(): void {
    this.unsubscribeUser();
    this.userSubscription = this.authService.getCurrentUserStream().subscribe(user => {
      if (user && user.shopId) {
        this.shopId = user.shopId;
        const url = this.router.url;
        this.urlSplit = url.split('/');
        this.initData();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeData();
    this.unsubscribeUser();
    this.page.destroy();
  }

  ngAfterViewInit(): void {
  }

  unsubscribeData() {
    if (this.dataSubscription && !this.dataSubscription.closed) { this.dataSubscription.unsubscribe(); }
    if (this.analyticsSubscription && !this.analyticsSubscription.closed) { this.analyticsSubscription.unsubscribe(); }
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

  pageEvents(event: PageEvent) {
    if (event.previousPageIndex < event.pageIndex) {
      this.page.more();
    }
    if (this.pageSize !== event.pageSize) {
      this.initData();
    }
  }

  initData() {

    this.unsubscribeData();
    const { urlSplit } = this;
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

    if (urlSplit.includes(PRODUCT)) {

      this.heading = 'Products';
      this.label = 'Product';
      this.getData(products, {
        name: 'Name',
        price: 'Price'
      });
      this.getPageLength(products, this.dataLengthKey);

    } else if (urlSplit.includes(COLLECTION)) {

      this.heading = 'Collections';
      this.label = 'Collection';
      this.getData(collections, {
        name: 'Name',
        productId: 'No. of products',
        status: 'Status'
      });
      this.getPageLength(collections, this.dataLengthKey);

    } else if (urlSplit.includes(CATEGORY)) {

      this.heading = 'Categories';
      this.label = 'Category';
      this.getData(categories, {
        name: 'Name',
        subCategoryId: 'Subcategories',
        productId: 'No. of products'
      });
      this.getPageLength(categories, this.dataLengthKey);

    } else if (urlSplit.includes(PRODUCTTYPE)) {

      this.heading = 'Product Types';
      this.label = 'Product Type';
      this.getData(productTypes, {
        name: 'Name'
      });
      this.getPageLength(productTypes, this.dataLengthKey);

    } else if (urlSplit.includes(PRODUCTATTRIBUTE)) {

      this.heading = 'Attributes';
      this.label = 'Attribute';
      this.getData(attributes, {
        name: 'Name',
        code: 'Code',
        status: 'Status'
      });
      this.getPageLength(attributes, this.dataLengthKey);

    } else if (urlSplit.includes(SALE)) {

      this.heading = 'Sale Discounts';
      this.label = 'Sale Discount';
      this.getData(saleDiscounts, {
        name: 'Name',
        code: 'Code',
        value: 'Value',
        status: 'Status'
      });
      this.getPageLength(saleDiscounts, this.dataLengthKey);

    } else if (urlSplit.includes(VOUCHER)) {

      this.heading = 'Vouchers';
      this.label = 'Voucher';
      this.getData(vouchers, {
        code: 'Code',
        value: 'Value',
        status: 'Status'
      });
      this.getPageLength(vouchers, this.dataLengthKey);

    } else if (urlSplit.includes(SHIPPING)) {

      this.heading = 'Shipping';
      this.label = 'Shipping';
      this.getData(shipping, {
        name: 'Name',
        countries: 'Countries',
      });
      this.getPageLength(shipping, this.dataLengthKey);

    } else if (urlSplit.includes(WAREHOUSE)) {

      this.heading = 'Warehouse';
      this.label = 'Warehouse';
      this.getData(warehouse, {
        name: 'Name',
        shippingId: 'Shipping Zones',
      });
      this.getPageLength(warehouse, this.dataLengthKey);

    } else if (urlSplit.includes(ORDER)) {

      this.heading = 'Orders';
      this.label = '';
      this.getData(orders, {
        orderNo: 'Order No.',
        customerName: 'Customer Name',
        orderStatus: 'Order Status',
        orderId: 'No. of Orders',
        total: 'Total'
      });
      this.getPageLength(orders, this.dataLengthKey);

    } else if (urlSplit.includes(CUSTOMER)) {

      this.heading = 'Customers';
      this.label = '';
      this.getData(users, {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        orderId: 'No. of Orders'
      });
      this.getPageLength(users, this.dataLengthKey);

    } else if (urlSplit.includes(STAFF)) {

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
      this.getPageLength(users, this.dataLengthKey);

    }

  }

  getPageLength(path: string, key: string) {
    this.analyticsSubscription = this.admin.getCollectionAnalytics(path).subscribe(data => {
      if (data && data[key]) {
        this.resultLength = data[key];
      }
    });
  }

  getData(path: string, displayCols: any, where: Condition[] = []) {
    this.loading = true;
    this.displayedColumns = [];
    this.dataKeys = [];
    this.page.init(path, {
      orderBy: 'createdAt',
      reverse: true,
      where: [{ field: 'shopId', type: '==', value: this.shopId }, ...where],
      limit: this.pageSize
    });
    Object.entries(displayCols).forEach(([k, v]) => {
      this.dataKeys.push(k);
      this.displayedColumns.push(v as string);
    });
    this.dataSubscription = this.page.data.subscribe(data => {
      this.data = data;
      if (data && data.length > 0 && this.displayData.length > 0) {
        data.forEach((d: any) => {
          if (this.displayData.some(ed => ed.id === d.id)) {
            const idx = this.displayData.findIndex(ed => ed.id === d.id);
            this.displayData[idx] = d;
          } else {
            this.displayData.push(d);
          }
        });
        this.fillTable(this.displayData);
      } else if (data && data.length > 0) {
        this.displayData = data;
        this.fillTable(this.displayData);
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
