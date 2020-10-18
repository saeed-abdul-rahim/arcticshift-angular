import { Injectable } from '@angular/core';
import { AttributeInterface, AttributeJoinInterface } from '@models/Attribute';
import { ProductCondition, ProductInterface } from '@models/Product';
import { ProductTypeInterface } from '@models/ProductType';
import { DbService } from '@services/db/db.service';
import { uniqueArr } from '@utils/arrUtils';
import { getDataFromCollection } from '@utils/getFirestoreData';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable()
export class ProductService {

  private productsSubscription: Subscription;
  private productFilterSubscription: Subscription;
  private attributesSubscription: Subscription;

  private productList = new BehaviorSubject<ProductInterface[]>([]);
  private attributeList = new BehaviorSubject<AttributeJoinInterface[]>([]);
  private productFilters = new BehaviorSubject<ProductCondition[]>([]);
  private productListLoading = new BehaviorSubject<boolean>(false);
  private productListError = new BehaviorSubject<string>('');

  productList$ = this.productList.asObservable();
  productListError$ = this.productListError.asObservable();
  attributeList$ = this.attributeList.asObservable();
  productFilters$ = this.productFilters.asObservable();
  productListLoading$ = this.productListLoading.asObservable();

  constructor(private dbS: DbService) { }

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
    const products = this.dbS.queryProducts(filters);
    this.unsubscribeProducts();
    this.resetProductListLoaders();
    this.productListLoading.next(true);
    this.productsSubscription = getDataFromCollection(products).subscribe(data => {
      this.productListLoading.next(false);
      this.productList.next(data);
    },
    err => {
      this.productListError.next(err);
      console.log(err);
    });
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

  setProductsLoading(productListLoading: boolean) {
    this.productListLoading.next(productListLoading);
  }

  getProductsLoading() {
    return this.productListLoading$;
  }

  setProductsError(productListError: string) {
    this.productListError.next(productListError);
  }

  getProductsError() {
    return this.productListError$;
  }

  setProductFilters(productFilters: ProductCondition[]) {
    this.productFilters.next(productFilters);
  }

  getProductFilters() {
    return this.productFilters$;
  }

  resetProductFilters() {
    this.productFilters.next([]);
  }

  resetProductListLoaders() {
    this.productListLoading.next(false);
    this.productListError.next('');
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

}
