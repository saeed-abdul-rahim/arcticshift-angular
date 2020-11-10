import { Component, OnDestroy, OnInit } from '@angular/core';
import { slideInOut } from '@animations/slideInOut';
import { CategoryInterface } from '@models/Category';
import { CollectionInterface } from '@models/Collection';
import { User } from '@models/User';
import { AuthService } from '@services/auth/auth.service';
import { ModalService } from '@services/modal/modal.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

type JoinedCategories = CategoryInterface & {
  subCategories: JoinedCategories[];
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [slideInOut]
})
export class SidebarComponent implements OnInit, OnDestroy {

  displayCategories: JoinedCategories[];
  prevData: any[] = [];
  backLabels: string[] = [];

  user: User;
  collections: CollectionInterface[];
  categories: CategoryInterface[];
  initCategories = false;

  private categoriesData: CategoryInterface[];
  private categoriesSubscription: Subscription;
  private collectionsSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(private shop: ShopService, private auth: AuthService, private modal: ModalService) { }

  ngOnInit(): void {
    this.getCategories();
    this.getCollections();
    this.userSubscription = this.auth.getCurrentUserStream().subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    if (this.categoriesSubscription && !this.categoriesSubscription.closed) {
      this.categoriesSubscription.unsubscribe();
    }
    if (this.collectionsSubscription && !this.collectionsSubscription.closed) {
      this.collectionsSubscription.unsubscribe();
    }
    if (this.userSubscription && !this.userSubscription.closed) {
      this.userSubscription.unsubscribe();
    }
  }

  getCollections() {
    this.collectionsSubscription = this.shop.getCollections().subscribe(collections => this.collections = collections);
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
          this.displayCategories = this.categories as JoinedCategories[];
          this.initCategories = true;
        } else {
          this.displayCategories = this.displayCategories.map(category => {
            const { id } = category;
            const updatedCategory = categories.find(c => c.id === id);
            if (updatedCategory) {
              return { ...updatedCategory, subCategories: this.joinCategories(updatedCategory) };
            } else {
              return null;
            }
          }).filter(e => e);
        }
      }
    });
  }

  joinCategories(category?: CategoryInterface): JoinedCategories[] {
    if (category && category.subCategoryId && category.subCategoryId.length > 0) {
      const { subCategoryId } = category;
      return subCategoryId.map(id => {
        const subCategory = this.categoriesData.find(c => c.id === id);
        if (!subCategory) { return null; }
        return { ...subCategory, subCategories: this.joinCategories(subCategory) };
      }).filter(e => e);
    } else {
      return null;
    }
  }

  toSubmenu(id: string) {
    const subData = this.displayCategories.find((d) => d.id === id);
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

  toggleSignInModal() {
    this.modal.setShowSignInModal(true);
  }

  signOut() {
    this.auth.signOut();
  }

}
