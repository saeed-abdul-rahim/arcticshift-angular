import { Component, OnDestroy, OnInit } from '@angular/core';
import { slideInOut } from '@animations/slideInOut';
import { CategoryInterface } from '@models/Category';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [slideInOut]
})
export class SidebarComponent implements OnInit, OnDestroy {

  displayCategories: any;
  prevData: any[] = [];
  backLabels: string[] = [];

  categories: any[];
  initCategories = false;

  data = [
    {
      id: 'hdjksa7dsa90as',
      name: 'MEN',
      subs: [
        {
          id: 'hud8a79',
          name: 'SHIRTS',
          parentId: 'hdjksa7dsa90as',
          subs: [
            { id: 'hjdksal', name: 'T-SHIRTS' },
            { id: 'hds8a98', name: 'SHIRTS' }
          ]
        },
        { id: '898dhah', name: 'PANTS',
        parentId: 'hdjksa7dsa90as' }
      ]
    },
    {
      id: 'hudia8yhusa2eq',
      name: 'WOMEN',
      subs: [
        { id: 'hud8a79', name: 'BAGS' },
        { id: '898dhah', name: 'PURSES' }
      ]
    }
  ];

  private categoriesData: CategoryInterface[];
  private categoriesSubscription: Subscription;

  constructor(private shop: ShopService) { }

  ngOnInit(): void {
    this.getCategories();
  }

  ngOnDestroy() {
    if (this.categoriesSubscription && !this.categoriesSubscription.closed) {
      this.categoriesSubscription.unsubscribe();
    }
  }

  getCategories() {
    this.categoriesSubscription = this.shop.getCategories().subscribe(categories => {
      if (categories && categories.length > 0) {
        this.categoriesData = categories;
        const mainCategories = categories.filter(category => category.parentCategoryId === '');
        this.categories = mainCategories.map(category => {
          return { ...category, subCategories: this.joinCategories(category) };
        });
        if (!this.initCategories) {
          this.displayCategories = this.categories;
        }
      }
    });
  }

  joinCategories(category?: CategoryInterface) {
    if (category && category.subCategoryId && category.subCategoryId.length > 0) {
      const { subCategoryId } = category;
      return subCategoryId.map(id => {
        const subCategory = this.categoriesData.find(c => c.id === id);
        return { ...subCategory, subCategories: this.joinCategories(subCategory) };
      });
    } else {
      return null;
    }
  }

  toSubmenu(id: string) {
    const subData = this.displayCategories.find((d: any) => d.id === id);
    if (!subData || !subData.subCategories || subData.subCategories.length === 0) {
      return;
    }
    this.prevData.push(this.displayCategories);
    this.backLabels.unshift(subData.name);
    this.displayCategories = subData.subCategories;
  }

  toPrevMenu() {
    this.displayCategories = this.prevData.pop();
    this.backLabels.shift();
  }

}
