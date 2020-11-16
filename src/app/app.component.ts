import { Component, OnInit } from '@angular/core';
import { ShopService } from '@services/shop/shop.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'articshift';

  constructor(private shop: ShopService) {}

  ngOnInit(): void {
    this.shop.getGeneralSettingsFromDb();
  }

}
