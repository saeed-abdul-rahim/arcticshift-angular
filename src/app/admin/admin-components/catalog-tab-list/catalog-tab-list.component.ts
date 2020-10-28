import {
  ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, IterableDiffer, IterableDiffers, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

import { AuthService } from '@services/auth/auth.service';
import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { ProductInterface } from '@models/Product';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';
import { uniqueArr } from '@utils/arrUtils';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CatalogType, AddCatalogEvent, RemoveCatalogEvent } from '@models/Event';
import { inOut } from '@animations/inOut';

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
  heading: string;
  filteredCatalog: any[] = [];
  selectedIds: string[] = [];
  existingIds: string[] = [];

  shopId: string;
  catalogDeleteId: string;
  allCatalogColumns = ['select', 'name'];
  allCatalog: MatTableDataSource<any>;
  allCatalogData = new Subject<any>();
  catalogColumns = ['name'];
  catalog: MatTableDataSource<any> = new MatTableDataSource([]);
  catalogData = new BehaviorSubject<any[]>([]);

  products: ProductInterface[] = [];
  categories: CategoryInterface[] = [];
  collections: CollectionInterface[] = [];
  allProducts: ProductInterface[] = [];
  allCategories: CategoryInterface[] = [];
  allCollections: CollectionInterface[] = [];

  private productIdsDiffer: IterableDiffer<string>;
  private categoryIdsDiffer: IterableDiffer<string>;
  private collectionIdsDiffer: IterableDiffer<string>;

  private catalogSubscription: Subscription;
  private allCatalogSubscription: Subscription;
  private productsSubscription: Subscription;
  private collectionsSubscription: Subscription;
  private categoriesSubscription: Subscription;
  private allProductSubscription: Subscription;
  private allCollectionSubscription: Subscription;
  private allCategorySubscription: Subscription;
  private userSubscription: Subscription;

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
    this.type = 'category'; // Initially load category
    this.allCatalogData.next([]);
    this.catalogData.next([]);
    this.fillAllCatalogTable();
    this.fillCatalogTable();
  }

  ngOnDestroy(): void {
    if (this.catalogSubscription && !this.catalogSubscription.closed) {
      this.catalogSubscription.unsubscribe();
    }
    if (this.allCatalogSubscription && !this.allCatalogSubscription.closed) {
      this.allCatalogSubscription.unsubscribe();
    }
    if (this.allCategorySubscription && !this.allCategorySubscription.closed) {
      this.allCategorySubscription.unsubscribe();
    }
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

  getAllProducts() {
    if (!this.allProductSubscription || this.allProductSubscription.closed) {
      this.allCatalogLoading = true;
      this.allProductSubscription = this.admin.getProductsByShopId(this.shopId)
        .subscribe(products => {
          this.allCatalogLoading = false;
          this.allProducts = products;
          if (this.type === 'product') {
            this.allCatalogData.next(this.allProducts);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.allCatalogData.next(this.allProducts);
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
            this.allCatalogData.next(this.allCategories);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.allCatalogData.next(this.allCategories);
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
            this.allCatalogData.next(this.allCollections);
          }
        }, err => {
          this.allCatalogLoading = false;
          this.handleError(err);
        });
    } else {
      this.allCatalogData.next(this.allCollections);
    }
  }

  modalCallback() {
    const { type } = this;
    this.addCatalog.emit({
      type,
      ids: this.selectedIds
    });
  }

  deleteId(id: string) {
    this.catalogDeleteId = id;
    const { type } = this;
    this.removeCatalog.emit({
      type, id
    });
  }

  setCatalogData($event: number) {
    this.selectedIds = [];
    switch ($event) {
      // Category Tab
      case 0:
        this.type = 'category';
        this.heading = 'Category';
        this.getCategoryByIds(this.productIds);
        break;

      // Collection Tab
      case 1:
        this.type = 'collection';
        this.heading = 'Collection';
        this.getCollectionByIds(this.collectionIds);
        break;

      // Product Tab
      case 2:
        this.type = 'product';
        this.heading = 'Product';
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

  fillAllCatalogTable() {
    this.allCatalogSubscription = this.allCatalogData.subscribe((data: any[]) => {
    try {
      this.filteredCatalog = data.filter(d => !this.existingIds.includes(d.id));
      this.allCatalog = new MatTableDataSource(this.filteredCatalog);
      this.cdr.detectChanges();
      } catch (err) { }
    });
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

  toggleShowModal() {
    this.showModal = !this.showModal;
    this.showModalChange.emit(this.showModal);
    switch (this.type) {
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
