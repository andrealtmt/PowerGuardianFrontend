import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumoDispositivoComponent } from './consumo-dispositivo.component';

describe('ConsumoDispositivoComponent', () => {
  let component: ConsumoDispositivoComponent;
  let fixture: ComponentFixture<ConsumoDispositivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumoDispositivoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumoDispositivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
