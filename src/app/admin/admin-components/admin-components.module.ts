import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from './tile/tile.component';
import { CardComponent } from './card/card.component';



@NgModule({
  declarations: [
    TileComponent,
    CardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TileComponent,
    CardComponent
  ]
})
export class AdminComponentsModule { }
