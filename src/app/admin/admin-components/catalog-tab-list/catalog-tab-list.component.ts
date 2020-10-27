import {
  ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, IterableDiffer, IterableDiffers, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs/internal/Subscription';

import { AuthService } from '@services/auth/auth.service';
import { AdminService } from '@services/admin/admin.service';
import { ProductInterface } from '@models/Product';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';
import { AlertService } from '@services/alert/alert.service';
import { uniqueArr } from '@utils/arrUtils';
import { Subject } from 'rxjs/internal/Subject';

type CatalogType = 'category' | 'collection' | 'product';

@Component({
  selector: 'app-catalog-tab-list',
  templateUrl: './catalog-tab-list.component.html',
  styleUrls: ['./catalog-tab-list.component.css']
})
export class CatalogTabListComponent implements OnInit, OnDestroy, DoCheck {

  @Input() productIds: string[] = [];
  @Input() categoryIds: string[] = [];
  @Input() collectionIds: string[] = [];

  @Output() productCallback = new EventEmitter<string[]>();
  @Output() categoryCallback = new EventEmitter<string[]>();
  @Output() collectionCallback = new EventEmitter<string[]>();

  productIdsDiffer: IterableDiffer<string>;
  categoryIdsDiffer: IterableDiffer<string>;
  collectionIdsDiffer: IterableDiffer<string>;

  modalLoading = false;
  modalSuccess = false;
  productsLoading = false;
  categoriesLoading = false;
  collectionsLoading = false;
  allCatalogLoading = false;
  showModal = false;
  type: CatalogType;
  filteredCatalog: any[] = [];
  selectedIds: string[] = [];
  existingIds: string[] = [];

  shopId: string;
  allCatalogColumns = ['select', 'name'];
  allCatalog: MatTableDataSource<any>;
  allCatalogData = new Subject<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  products: ProductInterface[];
  categories: CategoryInterface[];
  collections: CollectionInterface[];
  allProducts: ProductInterface[];
  allCategories: CategoryInterface[];
  allCollections: CollectionInterface[];

  productsSubscription: Subscription;
  collectionsSubscription: Subscription;
  categoriesSubscription: Subscription;
  allProductSubscription: Subscription;
  allCollectionSubscription: Subscription;
  allCategorySubscription: Subscription;
  userSubscription: Subscription;

  constructor(private admin: AdminService, private auth: AuthService, private iterableDiffers: IterableDiffers,
              private cdr: ChangeDetectorRef, private alert: AlertService) { }

  ngOnInit(): void {
    this.productIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.categoryIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.collectionIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { shopId } = user;
        this.shopId = shopId;
      }
    });
    this.allCatalogData.next([]);
    this.getProductByIds(this.productIds);
    this.getCategoryByIds(this.categoryIds);
    this.getCollectionByIds(this.collectionIds);
    this.fillAllCatalogTable();
  }

  ngOnDestroy(): void {
    if (this.allProductSubscription && !this.allProductSubscription.closed) {
      this.allProductSubscription.unsubscribe();
    }
    if (this.allCollectionSubscription && !this.allCollectionSubscription.closed) {
      this.allCollectionSubscription.unsubscribe();
    }
    if (this.allCategorySubscription && !this.allCategorySubscription.closed) {
      this.allCategorySubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
    this.unsubscribeProducts();
    this.unsubscribeCategories();
    this.unsubscribeCollections();
  }

  ngDoCheck() {
    const productIdChange = this.productIdsDiffer.diff(this.productIds);
    const categoryIdChange = this.categoryIdsDiffer.diff(this.categoryIds);
    const collectionIdChange = this.collectionIdsDiffer.diff(this.collectionIds);
    if (productIdChange) {
      this.getProductByIds(this.productIds);
    }
    if (categoryIdChange) {
      this.getCategoryByIds(this.categoryIds);
    }
    if (collectionIdChange) {
      this.getCollectionByIds(this.collectionIds);
    }
  }

  unsubscribeProducts() {
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
  }

  unsubscribeCategories() {
    if (this.categoriesSubscription && !this.categoriesSubscription.closed) {
      this.categoriesSubscription.unsubscribe();
    }
  }

  unsubscribeCollections() {
    if (this.collectionsSubscription && !this.collectionsSubscription.closed) {
      this.collectionsSubscription.unsubscribe();
    }
  }

  getProductByIds(ids: string[]) {
    this.unsubscribeProducts();
    this.productsLoading = true;
    this.productsSubscription = this.admin.getProductbyIds(ids)
      .subscribe(products => {
        this.productsLoading = false;
        this.products = products;
        this.addToExistingIds(products);
      }, err => {
        this.productsLoading = false;
        this.handleError(err);
      });
  }

  getCategoryByIds(ids: string[]) {
    this.unsubscribeCategories();
    this.categoriesLoading = true;
    this.categoriesSubscription = this.admin.getCategorybyIds(ids)
      .subscribe(categories => {
        this.categoriesLoading = false;
        this.categories = categories;
        this.addToExistingIds(categories);
      }, err => {
        this.categoriesLoading = false;
        this.handleError(err);
      });
  }

  getCollectionByIds(ids: string[]) {
    this.unsubscribeCollections();
    this.collectionsLoading = true;
    this.collectionsSubscription = this.admin.getCollectionbyIds(ids)
      .subscribe(collections => {
        this.collectionsLoading = false;
        this.collections = collections;
        this.addToExistingIds(collections);
      }, err => {
        this.collectionsLoading = false;
        this.handleError(err);
      });
  }

  getAllProducts() {
    if (!this.allProductSubscription || this.allProductSubscription.closed) {
      this.allCatalogLoading = true;
      this.allProductSubscription = this.admin.getProductsByShopId(this.shopId)
        .subscribe(products => {
          this.allCatalogLoading = false;
          this.allProducts = products;
          if (this.type === 'product') {
            this.assignFilteredCatalog(products);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.assignFilteredCatalog(this.allProducts);
    }
  }

  getAllCategories() {
    if (!this.allCategorySubscription || this.allCategorySubscription.closed) {
      this.allCatalogLoading = true;
      this.allCategorySubscription = this.admin.getCategoriesByShopId(this.shopId)
        .subscribe(categories => {
          this.allCatalogLoading = false;
          this.allCategories = categories;
          if (this.type === 'category') {
            this.assignFilteredCatalog(categories);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.assignFilteredCatalog(this.allCategories);
    }
  }

  getAllCollections() {
    if (!this.allCollectionSubscription || this.allCollectionSubscription.closed){
      this.allCatalogLoading = true;
      this.allCollectionSubscription = this.admin.getCollectionsByShopId(this.shopId)
        .subscribe(collections => {
          this.allCatalogLoading = false;
          this.allCollections = collections;
          if (this.type === 'collection') {
            this.assignFilteredCatalog(collections);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.assignFilteredCatalog(this.allCollections);
    }
  }

  modalCallback() {
    const { type } = this;
    switch (type) {
      case 'product':
        this.productCallback.emit(this.selectedIds);
        break;
      case 'category':
        this.categoryCallback.emit(this.selectedIds);
        break;
      case 'collection':
        this.collectionCallback.emit(this.selectedIds);
        break;
    }
  }

  addToExistingIds(obj: any[]) {
    try {
      const ids = obj.map(o => o.id);
      this.existingIds = uniqueArr([ ...this.existingIds, ...ids ]);
    } catch (err) {}
  }

  fillAllCatalogTable() {
    this.allCatalogData.subscribe(data => {
    try {
      console.log(data);
      this.allCatalog = new MatTableDataSource(data);
      this.cdr.detectChanges();
      } catch (err) { }
    });
  }

  assignFilteredCatalog(data: any[]) {
    this.filteredCatalog = data.filter(d => !this.existingIds.includes(d.id));
    this.allCatalogData.next(this.filteredCatalog);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allCatalog.filter = filterValue.trim().toLowerCase();
  }

  assignCheckbox(event: Event, id: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(i => id !== i);
    }
  }

  toggleShowModal(type: CatalogType) {
    this.type = type;
    this.showModal = !this.showModal;
    switch (type) {
      case 'product':
        this.getAllProducts();
        break;
      case 'category':
        this.getAllCategories();
        break;
      case 'collection':
        this.getAllCollections();
        break;
    }
  }

  handleError(err: any) {
    const { message } = err;
    this.alert.alert({ message });
  }

}
