import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMAGE_XL } from '@constants/imageSize';
import { CollectionInterface } from '@models/Collection';
import { Content } from '@models/Common';
import { AlertService } from '@services/alert/alert.service';
import { ShopService } from '@services/shop/shop.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {

  innerWidth: any;

  collection: CollectionInterface;
  collectionSubscription: Subscription;
  images: CollectionInterface[] = [];
  image: CollectionInterface;

  collectionLoading = false;

  selectedImage = '';
  selectedThumbnail = '';
  carouselImages: any[] = [];
  carouselImageSize = IMAGE_XL;

  constructor(private shop: ShopService, private alert: AlertService) { }

  ngOnInit(): void {
    this.getCollections();
  }
  ngOnDestroy(): void {
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
  }

  getCollections() {
    this.collectionLoading = true;
    this.collectionSubscription = this.shop.getCollectionByfeatureOnHomePage().subscribe(collections => {
      this.collectionLoading = false;
      if (collections) {
        const thumbnails = collections.map(collection => {
          const { collectionId, name, images } = collection;
          if (images.length > 0) {
            const thumbnail = this.setCarouselImages(images, name);
            console.log(thumbnail);
            return {collectionId, ...thumbnail};
          }
        });
        this.carouselImages = thumbnails;
        console.log(this.carouselImages);
      }
    }, error => this.handleError(error.message));
  }

  setCarouselImages(images: Content[], name: string) {
    const image = images[0];
    const thumbnail = image.thumbnails.find(thumb => thumb.dimension === this.carouselImageSize);
    thumbnail.name = name;
    return { ...thumbnail, image };
  }

  handleError(err: any) {
    this.alert.alert(err);
  }
}
