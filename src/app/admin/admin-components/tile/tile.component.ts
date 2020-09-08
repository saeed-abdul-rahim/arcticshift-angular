import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {

  @Input() label: string;
  @Input() value: string;
  @Input() subValue: string;
  @Input() iconContainerColor: string;
  @Input() subValueColor: string;
  @Input() subLabel: string;

  constructor() { }

  ngOnInit(): void {
  }

}
