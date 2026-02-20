import { TestBed } from '@angular/core/testing';

import { CimaBackendService } from './cima-backend.service';

describe('CimaBackendService', () => {
  let service: CimaBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CimaBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
