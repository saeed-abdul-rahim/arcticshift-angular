import { ChangeDetectorRef, Component, DoCheck, EventEmitter, Input, IterableDiffer, IterableDiffers, OnDestroy, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';

import { AdminService } from '@services/admin/admin.service';
import { AlertService } from '@services/alert/alert.service';
import { AuthService } from '@services/auth/auth.service';
import { AddCatalogEvent } from '@models/Event';
import { CatalogType } from '@models/Metadata';
import { ProductInterface } from '@models/Product';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';
import { getSmallestThumbnail } from '@utils/media';

@Component({
  selector: 'app-catalog-modal-list',
  templateUrl: './catalog-modal-list.component.html',
  styleUrls: ['./catalog-modal-list.component.css']
})
export class CatalogModalListComponent implements OnInit, OnDestroy, DoCheck {

  @Input() existingIds: string[] = [];
  @Input() type: CatalogType;
  @Input() showModal: boolean;
  @Input() loading: boolean;
  @Input() success: boolean;

  @Output() showModalChange = new EventEmitter<boolean>();
  @Output() addCatalog = new EventEmitter<AddCatalogEvent>();

  heading: string;
  allCatalogLoading = false;
  allCatalogColumns = ['select', 'image', 'name'];
  allCatalog: MatTableDataSource<any>;
  allCatalogData = new Subject<any>();

  filteredCatalog: any[] = [];
  allProducts: ProductInterface[] = [];
  allCategories: CategoryInterface[] = [];
  allCollections: CollectionInterface[] = [];

  getSmallestThumbnail = getSmallestThumbnail;

  private prevType: CatalogType;
  private prevShowModal: boolean;
  private shopId: string;
  private selectedIds: string[] = [];
  private existingIdsDiffer: IterableDiffer<string>;

  private allCatalogSubscription: Subscription;
  private allProductSubscription: Subscription;
  private allCollectionSubscription: Subscription;
  private allCategorySubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private auth: AuthService, private admin: AdminService, private alert: AlertService,
              private cdr: ChangeDetectorRef, private iterableDiffers: IterableDiffers) { }

  ngOnInit(): void {
    this.existingIdsDiffer = this.iterableDiffers.find([]).create(null);
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => {
      if (user) {
        const { shopId } = user;
        this.shopId = shopId;
      }
    });
    this.fillAllCatalogTable();
  }

  ngDoCheck(): void {
    if (!this.prevShowModal && this.showModal) {
      this.selectedIds = [];
    }
    if (this.prevShowModal !== this.showModal) {
      this.prevShowModal = this.showModal;
    }
    if (this.type !== this.prevType) {
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
      this.prevType = this.type;
    }
    const existingIdChange = this.existingIdsDiffer.diff(this.existingIds);
    if (existingIdChange) {
      switch (this.type) {
        case 'product':
          this.allCatalogData.next(this.allProducts);
          break;
        case 'category':
          this.allCatalogData.next(this.allCategories);
          break;
        case 'collection':
          this.allCatalogData.next(this.allCollections);
          break;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.allCatalogSubscription && !this.allCatalogSubscription.closed) {
      this.allCatalogSubscription.unsubscribe();
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

  modalCallback() {
    const { type, selectedIds } = this;
    this.addCatalog.emit({
      type,
      ids: selectedIds
    });
  }

  handleError(err: any) {
    this.alert.alert({ message: err });
  }

}
