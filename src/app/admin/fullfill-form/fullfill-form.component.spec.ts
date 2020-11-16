import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullfillFormComponent } from './fullfill-form.component';

describe('FullfillFormComponent', () => {
  let component: FullfillFormComponent;
  let fixture: ComponentFixture<FullfillFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullfillFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullfillFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
