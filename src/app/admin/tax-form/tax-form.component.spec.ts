import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxFormComponent } from './tax-form.component';

describe('TaxFormComponent', () => {
  let component: TaxFormComponent;
  let fixture: ComponentFixture<TaxFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
