import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogModalListComponent } from './catalog-modal-list.component';

describe('CatalogModalListComponent', () => {
  let component: CatalogModalListComponent;
  let fixture: ComponentFixture<CatalogModalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogModalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogModalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
