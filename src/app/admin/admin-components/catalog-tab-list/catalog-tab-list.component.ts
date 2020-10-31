import {
  ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, IterableDiffer, IterableDiffers, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs/internal/Subscription';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ProductInterface } from '@models/Product';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';
import { uniqueArr } from '@utils/arrUtils';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AddCatalogEvent, RemoveCatalogEvent } from '@models/Event';
import { inOut } from '@animations/inOut';
import { CatalogType } from '@models/Metadata';

@Component({
  selector: 'app-catalog-tab-list',
  templateUrl: './catalog-tab-list.component.html',
  styleUrls: ['./catalog-tab-list.component.css'],
  animations: [inOut]
})
export class CatalogTabListComponent implements OnInit, OnDestroy, DoCheck {

  @Input() productIds: string[] = [];
  @Input() categoryIds: string[] = [];
  @Input() collectionIds: string[] = [];
  @Input() modalLoading: boolean;
  @Input() modalSuccess: boolean;
  @Input() removeLoading: boolean;
  @Input() showModal = false;

  @Output() addCatalog = new EventEmitter<AddCatalogEvent>();
  @Output() removeCatalog = new EventEmitter<RemoveCatalogEvent>();
  @Output() showModalChange = new EventEmitter<boolean>();

  faTrash = faTrash;
  catalogLoading = false;
  allCatalogLoading = false;
  type: CatalogType;
  existingIds: string[] = [];

  catalogDeleteId: string;
  catalogColumns = ['name'];
  catalog: MatTableDataSource<any> = new MatTableDataSource([]);
  catalogData = new BehaviorSubject<any[]>([]);

  products: ProductInterface[] = [];
  categories: CategoryInterface[] = [];
  collections: CollectionInterface[] = [];

  private productIdsDiffer: IterableDiffer<string>;
  private categoryIdsDiffer: IterableDiffer<string>;
  private collectionIdsDiffer: IterableDiffer<string>;

  private catalogSubscription: Subscription;
  private productsSubscription: Subscription;
  private collectionsSubscription: Subscription;
  private categoriesSubscription: Subscription;

  constructor(private admin: AdminService, private iterableDiffers: IterableDiffers,
              private cdr: ChangeDetectorRef, private alert: AlertService) { }

  ngOnInit(): void {
    this.productIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.categoryIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.collectionIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.type = 'category'; // Initially load category
    this.catalogData.next([]);
    this.fillCatalogTable();
  }

  ngOnDestroy(): void {
    if (this.catalogSubscription && !this.catalogSubscription.closed) {
      this.catalogSubscription.unsubscribe();
    }
    this.unsubscribeProducts();
    this.unsubscribeCategories();
    this.unsubscribeCollections();
  }

  ngDoCheck() {
    const productIdChange = this.productIdsDiffer.diff(this.productIds);
    const categoryIdChange = this.categoryIdsDiffer.diff(this.categoryIds);
    const collectionIdChange = this.collectionIdsDiffer.diff(this.collectionIds);
    if (productIdChange || categoryIdChange || collectionIdChange) {
      this.existingIds = [ ...this.productIds, ...this.categoryIds, ...this.collectionIds ];
    }
    if (productIdChange) {
      this.getProductByIds(this.productIds, true);
    }
    if (categoryIdChange) {
      this.getCategoryByIds(this.categoryIds, true);
    }
    if (collectionIdChange) {
      this.getCollectionByIds(this.collectionIds, true);
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

  getProductByIds(ids: string[], change = false) {
    if (change) {
      this.addToExistingIds(ids);
      this.unsubscribeProducts();
    }
    if (ids.length === 0) {
      this.products = [];
    }
    if ((!this.productsSubscription || this.productsSubscription.closed) && this.productIds && this.productIds.length > 0) {
      this.catalogLoading = true;
      this.productsSubscription = this.admin.getProductbyIds(ids)
        .subscribe(products => {
          this.catalogLoading = false;
          this.products = products;
          this.addToExistingIds(products);
          if (this.type === 'product') {
            this.catalogData.next(products);
          }
        }, err => {
          this.catalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.catalogData.next(this.products);
    }
  }

  getCategoryByIds(ids: string[], change = false) {
    if (change) {
      this.addToExistingIds(ids);
      this.unsubscribeCategories();
    }
    if (ids.length === 0) {
      this.categories = [];
    }
    if ((!this.categoriesSubscription || this.categoriesSubscription.closed) && this.categoryIds && this.categoryIds.length > 0) {
      this.catalogLoading = true;
      this.categoriesSubscription = this.admin.getCategorybyIds(ids)
        .subscribe(categories => {
          this.catalogLoading = false;
          this.categories = categories;
          this.addToExistingIds(categories);
          if (this.type === 'category') {
            this.catalogData.next(categories);
          }
        }, err => {
          this.catalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.catalogData.next(this.categories);
    }
  }

  getCollectionByIds(ids: string[], change = false) {
    if (change) {
      this.addToExistingIds(ids);
      this.unsubscribeCollections();
    }
    if (ids.length === 0) {
      this.collections = [];
    }
    if ((!this.collectionsSubscription || this.collectionsSubscription.closed) && this.collectionIds && this.collectionIds.length > 0) {
      this.catalogLoading = true;
      this.collectionsSubscription = this.admin.getCollectionbyIds(ids)
        .subscribe(collections => {
          this.catalogLoading = false;
          this.collections = collections;
          this.addToExistingIds(collections);
          if (this.type === 'collection') {
            this.catalogData.next(collections);
          }
        }, err => {
          this.catalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.catalogData.next(this.collections);
    }
  }

  deleteId(id: string) {
    this.catalogDeleteId = id;
    const { type } = this;
    this.removeCatalog.emit({
      type, id
    });
  }

  setCatalogData($event: number) {
    switch ($event) {
      // Category Tab
      case 0:
        this.type = 'category';
        this.getCategoryByIds(this.categoryIds);
        break;

      // Collection Tab
      case 1:
        this.type = 'collection';
        this.getCollectionByIds(this.collectionIds);
        break;

      // Product Tab
      case 2:
        this.type = 'product';
        this.getProductByIds(this.productIds);
        break;
    }
  }

  addToExistingIds(obj: any[]) {
    try {
      const ids = obj.map(o => o.id);
      this.existingIds = uniqueArr([ ...this.existingIds, ...ids ]);
    } catch (err) {}
  }

  fillCatalogTable() {
    this.catalogSubscription = this.catalogData.subscribe(data => {
      try {
        this.catalog = new MatTableDataSource(data);
        this.cdr.detectChanges();
      } catch (err) {}
    });
  }

  toggleShowModal() {
    this.showModal = true;
    this.showModalChange.emit(this.showModal);
  }

  handleError(err: any) {
    const { message } = err;
    this.alert.alert({ message });
  }

}
