import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { environment } from '@environment';
import { AuthService } from '@services/auth/auth.service';
import { ShopService } from '@services/shop/shop.service';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css']
})
export class ListPageComponent implements OnInit, OnDestroy, AfterViewInit {

  loading: boolean;
  shopId: string;
  heading: string;
  urlSplit: string[];
  data: any[];

  userSubscription: Subscription;
  dataSubscription: Subscription;

  displayedColumns: string[];
  displayedColumnsDataKeys: string[];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private productsPath: string;
  private categoriesPath: string;
  private collectionsPath: string;
  private saleDiscountsPath: string;
  private vouchersPath: string;

  constructor(private router: Router, private authService: AuthService, private shopService: ShopService,
              private cdr: ChangeDetectorRef) {
    const { db } = environment;
    const {
      products,
      categories,
      collections,
      saleDiscounts,
      vouchers
    } = db;
    this.productsPath = products;
  }

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

  ngAfterViewInit(): void {
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
    this.loading = true;
    this.unsubscribeData();
    const { shopId, shopService } = this;

    if (urlSplit.includes('product')) {
      this.heading = 'Product';
      this.dataSubscription = shopService.getAllProductsByShopId(shopId).subscribe(data => {
        if (data) {
          this.displayedColumns = ['Name', 'Price'];
          this.displayedColumnsDataKeys = ['name', 'price'];
          const filteredData = data.map(d => {
            return { id: d.id, name: d.name, price: d.price };
          });
          this.fillTable(filteredData);
          // this.getData(data, this.displayedColumnsDataKeys, this.displayedColumns);
        }
        this.loading = false;
      });
    } else if (urlSplit.includes('collection')) {
      this.heading = 'Collection';
      this.dataSubscription = shopService.getAllCollectionsByShopId(shopId).subscribe(data => {
        if (data) {
          this.displayedColumns = ['Name'];
          this.displayedColumnsDataKeys = ['name'];
          const filteredData = data.map(d => {
            return { id: d.id, name: d.name };
          });
          this.fillTable(filteredData);
          // this.getData(data, this.displayedColumnsDataKeys, this.displayedColumns);
        }
        this.loading = false;
      });
    }

  }

  getData(data: any, ids: string[], cols: string[]) {
    this.displayedColumns = cols;
    this.displayedColumnsDataKeys = ids;
    console.log(data);
    const filteredData = data.map((d: any) => {
      return ids.reduce((a, b) => (a[b] = data[b], a), {});
    });
    this.fillTable(filteredData);
  }

  fillTable(data: any[]) {
    try {
      this.dataSource = new MatTableDataSource(data);
      this.cdr.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (err) {
    }
  }

}
