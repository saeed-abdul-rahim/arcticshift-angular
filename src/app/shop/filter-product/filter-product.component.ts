import { Component, OnInit } from '@angular/core';
import { AttributeJoinInterface } from '@models/Attribute';
import { ProductCondition } from '@models/Product';
import { ProductService } from '@services/product/product.service';

@Component({
  selector: 'app-filter-product',
  templateUrl: './filter-product.component.html',
  styleUrls: ['./filter-product.component.css']
})
export class FilterProductComponent implements OnInit {

  attributes: AttributeJoinInterface[];
  productFilters: ProductCondition[];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.getAttributeList().subscribe(attributes => this.attributes = attributes);
    this.productService.getProductFilters().subscribe(filters => {
      console.log(filters);
      this.productFilters = filters;
    });
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
    this.productService.setProductAttributeFilter(attributeId, attributeValueId);
  }

  isActiveAttributeFilter(attributeId: string, attributeValueId: string) {
    const activeFilter = this.productFilters.find(filter => filter.field === attributeId && filter.value === attributeValueId);
    if (activeFilter) {
      return true;
    }
    return false;
  }

}
