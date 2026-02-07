import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasUsuarioComponent } from './ventas-usuario.component';

describe('VentasUsuarioComponent', () => {
  let component: VentasUsuarioComponent;
  let fixture: ComponentFixture<VentasUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VentasUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentasUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
