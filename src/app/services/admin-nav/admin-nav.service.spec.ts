import { TestBed } from '@angular/core/testing';

import { AdminNavService } from './admin-nav.service';

describe('AdminNavService', () => {
  let service: AdminNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
