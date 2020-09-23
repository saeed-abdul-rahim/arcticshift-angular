import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { PaginationService } from '@services/pagination/pagination.service';

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
      this.getData(collections, {
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

    }

  }

  getData(path: string, displayData: any) {
    this.loading = true;
    this.displayedColumns = [];
    this.dataKeys = [];
    this.page.init(path, {
      field: 'createdAt',
      reverse: true,
      where: [{ field: 'shopId', type: '==', value: this.shopId }],
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
