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
export class CarouselComponent implements OnInit, OnDestroy{

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
  }
  ngOnDestroy(): void {
    if (this.collectionSubscription && !this.collectionSubscription.closed) {
      this.collectionSubscription.unsubscribe();
    }
  }

  getCollectionsByImages(id: string) {
    this.collectionLoading = true;
    this.collectionSubscription = this.shop.getCollectionByfeatureOnHomePage(id).subscribe(collections => {
      this.collectionLoading = false;
      if (collections){
        const thumbnails = collections.map(collection => {
          const { collectionId, name, images } = collection;
          const thumbnail = this.setCarouselImages(images, name);
          return { collectionId, ...thumbnail};
        });
        this.carouselImages = thumbnails;
      }
    }, error => this.handleError(error.message));
  }

  setCarouselImages(images: Content[], name: string) {
    let thumbnails: any[] = images.map(image => {
      const thumbnail = image.thumbnails.find(thumb => thumb.dimension === this.carouselImageSize);
      return { ...thumbnail, image };
    });
    thumbnails = thumbnails.map(thumbnail => {
      thumbnail.name = name;
      return thumbnail;
    });
    return thumbnails;
  }

  handleError(err: any) {
    this.alert.alert(err);
  }
}
