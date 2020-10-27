import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogTabListComponent } from './catalog-tab-list.component';

describe('CatalogTabListComponent', () => {
  let component: CatalogTabListComponent;
  let fixture: ComponentFixture<CatalogTabListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogTabListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogTabListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
