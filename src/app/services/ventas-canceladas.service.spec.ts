import { TestBed } from '@angular/core/testing';

import { VentasCanceladasService } from './ventas-canceladas.service';

describe('VentasCanceladasService', () => {
  let service: VentasCanceladasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentasCanceladasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
