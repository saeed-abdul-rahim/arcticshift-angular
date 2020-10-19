import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@services/seo/seo.service';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit {

  constructor(private route: ActivatedRoute, private seo: SeoService) {
    const params = this.route.snapshot.paramMap;
    const title = params.get('title');
    const id = params.get('id');
    this.seo.updateTitle(title);
    this.seo.updateOgUrl(this.route.snapshot.url.join('/'));
  }

  ngOnInit(): void {
  }

}
