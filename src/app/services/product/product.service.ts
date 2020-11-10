import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Subscription } from 'rxjs/internal/Subscription';

import { AlertService } from '@services/alert/alert.service';
import { DbService } from '@services/db/db.service';
import { PaginationService } from '@services/pagination/pagination.service';
import { AttributeInterface, AttributeJoinInterface } from '@models/Attribute';
import { ProductCondition, ProductInterface } from '@models/Product';
import { ProductTypeInterface } from '@models/ProductType';
import { patchArrObj, uniqueArr } from '@utils/arrUtils';
import { getDataFromCollection } from '@utils/getFirestoreData';

@Injectable()
export class ProductService {

  private productsSubscription: Subscription;
  private productFilterSubscription: Subscription;
  private attributesSubscription: Subscription;

  private productList = new BehaviorSubject<ProductInterface[]>([]);
  private attributeList = new BehaviorSubject<AttributeJoinInterface[]>([]);
  private productFilters = new BehaviorSubject<ProductCondition[]>([]);

  productList$ = this.productList.asObservable();
  attributeList$ = this.attributeList.asObservable();
  productFilters$ = this.productFilters.asObservable();

  constructor(private dbS: DbService, private page: PaginationService, private alert: AlertService) { }

  destroy(): void {
    this.unsubscribeProducts();
    this.unsubscribeAttributes();
  }

  unsubscribeProducts() {
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
  }

  unsubscribeProductFilters() {
    if (this.productFilterSubscription && !this.productFilterSubscription.closed) {
      this.productFilterSubscription.unsubscribe();
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
    const filtered = oldValues.filter(data => data.field !== attributeId);
    const productFilter: ProductCondition = { field: attributeId, type: '==', value: attributeValueId, parentFields: ['attributes'] };
    this.setProductFilters([...filtered, productFilter]);
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

  getProductsFromDb(filters: ProductCondition[] = []) {
    const statusFilter = filters.find(filter => filter.field === 'status');
    if (!statusFilter) {
      filters.push({
        field: 'status', type: '==', value: 'active'
      });
    }
    const { dbProductsRoute } = this.dbS;
    this.unsubscribeProducts();
    this.page.destroy();
    this.page.init(dbProductsRoute, {
      where: filters,
      limit: 1
    });
    this.productsSubscription = this.page.data.subscribe((data: ProductInterface[]) => {
      if (data && data.length > 0 && this.productList.value.length > 0) {
        let productList = this.productList.value;
        productList = patchArrObj(data, productList, 'id');
        this.productList.next(productList);
      } else if (data && data.length > 0) {
        this.productList.next(data);
      } else if (data && data.length === 0) {
        this.productList.next([]);
      }
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
    this.productFilters.next(productFilters);
    this.getProductsFromDb(productFilters);
  }

  getProductFilters() {
    return this.productFilters$;
  }

  resetProductFilters() {
    this.productFilters.next([]);
  }

  addProductFilter(filter: ProductCondition) {
    const { value } = this.productFilters;
    this.productFilters.next([...value, filter]);
  }

  removeProductFilter(conditionValue: any) {
    const { value } = this.productFilters;
    const filteredValue = value.filter(v => v.value !== conditionValue);
    this.productFilters.next(filteredValue);
  }

  handleError(err: any) {
    this.alert.alert({ message: err.message });
  }

}
