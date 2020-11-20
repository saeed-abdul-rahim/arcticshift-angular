import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Subscription } from 'rxjs/internal/Subscription';

import { AlertService } from '@services/alert/alert.service';
import { DbService } from '@services/db/db.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { AttributeInterface, AttributeJoinInterface } from '@models/Attribute';
import { ProductCondition, ProductInterface, ProductOrderBy } from '@models/Product';
import { ProductTypeInterface } from '@models/ProductType';
import { uniqueArr } from '@utils/arrUtils';
import { getDataFromCollection } from '@utils/getFirestoreData';

@Injectable()
export class ProductService {

  private productListSubscription: Subscription;
  private productFilterSubscription: Subscription;
  private productSortSubscription: Subscription;
  private attributesSubscription: Subscription;

  private productList = new BehaviorSubject<ProductInterface[]>([]);
  private attributeList = new BehaviorSubject<AttributeJoinInterface[]>([]);
  private productFilters = new BehaviorSubject<ProductCondition[]>([]);
  private productSort = new BehaviorSubject<ProductOrderBy>(null);

  productList$ = this.productList.asObservable();
  attributeList$ = this.attributeList.asObservable();
  productFilters$ = this.productFilters.asObservable();
  productSort$ = this.productSort.asObservable();

  constructor(private dbS: DbService, private page: PaginationService, private alert: AlertService) { }

  destroy(): void {
    this.unsubscribeProductList();
    this.unsubscribeProductFilters();
    this.unsubscribeProductSort();
    this.unsubscribeAttributes();
  }

  unsubscribeProductList() {
    if (this.productListSubscription && !this.productListSubscription.closed) {
      this.productListSubscription.unsubscribe();
    }
  }

  unsubscribeProductFilters() {
    if (this.productFilterSubscription && !this.productFilterSubscription.closed) {
      this.productFilterSubscription.unsubscribe();
    }
  }

  unsubscribeProductSort() {
    if (this.productSortSubscription && !this.productSortSubscription.closed) {
      this.productSortSubscription.unsubscribe();
    }
  }

  unsubscribeAttributes() {
    if (this.attributesSubscription && !this.attributesSubscription.closed) {
      this.attributesSubscription.unsubscribe();
    }
  }

  setProductCatColFilter(id: string, type: 'categoryId' | 'collectionId') {
    const productFilter: ProductCondition = { field: type, type: 'array-contains', value: id };
    this.setProductFilters([productFilter]);
  }

  setProductAttributeFilter(attributeId: string, attributeValueId: string) {
    const oldValues = this.productFilters.value;
    const productFilter: ProductCondition = { field: attributeId, type: '==', value: attributeValueId, parentFields: ['attributes'] };
    this.setProductFilters([...oldValues, productFilter]);
  }

  removeProductAttributeFilter(attributeValueId: string) {
    let values = this.productFilters.value;
    values = values.filter(filter => filter.value !== attributeValueId);
    this.setProductFilters(values);
  }

  getAttributesFromDb() {
    const { db, dbProductTypesRoute } = this.dbS;
    const productTypes = db.collection(dbProductTypesRoute);
    this.unsubscribeAttributes();
    this.attributesSubscription = getDataFromCollection(productTypes).pipe(
      switchMap((data: ProductTypeInterface[]) => {
        let attributeIds = data.map(d => d.productAttributeId).reduce((acc, curr) => [...acc, ...curr], []);
        attributeIds = uniqueArr(attributeIds);
        return this.dbS.getAttributeByIds(attributeIds);
      })
    ).subscribe(attributes => this.attributeList.next(attributes));
  }

  getProductsFromDb(filters: ProductCondition[] = [], orderBy?: ProductOrderBy) {
    const statusFilter = filters.find(filter => filter.field === 'status');
    if (!statusFilter) {
      filters.push({
        field: 'status', type: '==', value: 'active'
      });
    }
    const { dbProductsRoute } = this.dbS;
    this.unsubscribeProductList();
    this.page.init(dbProductsRoute, {
      where: filters,
      orderBy,
      limit: 1
    });
    this.productListSubscription = this.page.data.subscribe((data: ProductInterface[]) => {
      this.productList.next(data);
    },
    err => {
      this.handleError(err);
    });
  }

  loadMoreProducts() {
    this.page.more();
  }

  isProductsDone() {
    return this.page.done;
  }

  isProductsLoading() {
    return this.page.loading;
  }

  getProducts() {
    this.unsubscribeProductFilters();
    this.productFilterSubscription = this.productFilters$.subscribe(filters => this.getProductsFromDb(filters));
    return this.getProductList();
  }

  setProductList(productList: ProductInterface[]) {
    this.productList.next(productList);
  }

  getProductList() {
    return this.productList$;
  }

  setAttributeList(attributeList: AttributeInterface[]) {
    this.attributeList.next(attributeList);
  }

  getAttributeList() {
    return this.attributeList$;
  }

  setProductFilters(productFilters: ProductCondition[]) {
    const sort = this.productSort.value;
    this.productFilters.next(productFilters);
    this.getProductsFromDb(productFilters, sort);
  }

  getProductFilters() {
    return this.productFilters$;
  }

  setProductSort(sort: ProductOrderBy) {
    const productFilters = this.productFilters.value;
    this.productSort.next(sort);
    this.getProductsFromDb(productFilters, sort);
  }

  getProductSort() {
    return this.productSort$;
  }

  resetProductFilters() {
    this.productFilters.next([]);
    this.productSort.next(null);
    this.getProductsFromDb();
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
