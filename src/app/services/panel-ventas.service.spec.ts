import { TestBed } from '@angular/core/testing';

import { PanelVentasService } from './panel-ventas.service';

describe('PanelVentasService', () => {
  let service: PanelVentasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelVentasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
