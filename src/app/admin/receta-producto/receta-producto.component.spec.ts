import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecetaProductoComponent } from './receta-producto.component';

describe('RecetaProductoComponent', () => {
  let component: RecetaProductoComponent;
  let fixture: ComponentFixture<RecetaProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecetaProductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecetaProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
