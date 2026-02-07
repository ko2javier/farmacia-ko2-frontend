import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprasClienteComponent } from './compras-cliente.component';

describe('ComprasClienteComponent', () => {
  let component: ComprasClienteComponent;
  let fixture: ComponentFixture<ComprasClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComprasClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprasClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
