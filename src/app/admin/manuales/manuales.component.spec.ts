import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualesComponent } from './manuales.component';

describe('ManualesComponent', () => {
  let component: ManualesComponent;
  let fixture: ComponentFixture<ManualesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
