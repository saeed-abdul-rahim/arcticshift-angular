import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttributeJoinInterface } from '@models/Attribute';
import { ProductCondition, ProductOrderBy } from '@models/Product';
import { ProductService } from '@services/product/product.service';
import { Subscription } from 'rxjs/internal/Subscription';

type SortBy = {
  name: string
  sortBy: ProductOrderBy | null
};

@Component({
  selector: 'app-filter-product',
  templateUrl: './filter-product.component.html',
  styleUrls: ['./filter-product.component.css']
})
export class FilterProductComponent implements OnInit, OnDestroy {

  showFilter = false;
  showSort = false;
  sortByData: SortBy[] = [
    { name: 'Default', sortBy: null },
    {
      name: 'Newness',
      sortBy: {
        field: 'createdAt',
        direction: 'desc'
      }
    },
    {
      name: 'Popularity',
      sortBy: {
        field: 'clicks',
        direction: 'desc'
      }
    },
    {
      name: 'Price: Low to High',
      sortBy: {
        field: 'price',
        direction: 'asc'
      }
    },
    {
      name: 'Price: High to Low',
      sortBy: {
        field: 'price',
        direction: 'desc'
      }
    }
  ];

  attributes: AttributeJoinInterface[] = [];
  productFilters: ProductCondition[] = [];
  productSort: ProductOrderBy;

  private attributeSubscription: Subscription;
  private productFiltersSubscription: Subscription;
  private productSortSubscription: Subscription;

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.attributeSubscription = this.productService.getAttributeList().subscribe(attributes => this.attributes = attributes);
    this.productFiltersSubscription = this.productService.getProductFilters().subscribe(filters => this.productFilters = filters);
    this.productSortSubscription = this.productService.getProductSort().subscribe(sort => this.productSort = sort);
  }

  ngOnDestroy(): void {
    if (this.attributeSubscription && !this.attributeSubscription.closed) {
      this.attributeSubscription.unsubscribe();
    }
    if (this.productFiltersSubscription && !this.productFiltersSubscription.closed) {
      this.productFiltersSubscription.unsubscribe();
    }
    if (this.productSortSubscription && !this.productSortSubscription.closed) {
      this.productSortSubscription.unsubscribe();
    }
  }

  isColorAttribute(attribute: AttributeJoinInterface): boolean {
    const { attributeValues } = attribute;
    if (attributeValues && attributeValues.length > 0) {
      const values = attributeValues
        .map(value => value.name)
        .filter(value => value[0] === '#' && value.length === 7);
      return values.length === attributeValues.length;
    } else {
      return false;
    }
  }

  setProductFilter(attributeId: string, attributeValueId: string) {
    const isActive = this.isActiveAttributeFilter(attributeId, attributeValueId);
    if (!isActive) {
      this.productService.setProductAttributeFilter(attributeId, attributeValueId);
    } else {
      this.productService.removeProductAttributeFilter(attributeValueId);
    }
  }

  isActiveAttributeFilter(attributeId: string, attributeValueId: string) {
    const activeFilter = this.productFilters.find(filter => filter.field === attributeId && filter.value === attributeValueId);
    if (activeFilter) {
      return true;
    }
    return false;
  }

  setProductSort(sort: ProductOrderBy) {
    this.productService.setProductSort(sort);
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
    if (this.showFilter && this.showSort) {
      this.showSort = false;
    }
  }

  toggleSort() {
    this.showSort = !this.showSort;
    if (this.showFilter && this.showSort) {
      this.showFilter = false;
    }
  }

  clearFilters() {
    this.productService.resetProductFilters();
    this.router.navigateByUrl('');
  }

}
