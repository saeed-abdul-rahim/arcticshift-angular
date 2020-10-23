import { TestBed } from '@angular/core/testing';

import { ShopNavService } from './shop-nav.service';

describe('ShopNavService', () => {
  let service: ShopNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
