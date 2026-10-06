import { TestBed } from '@angular/core/testing';

import { SimulatorCoreService } from './simulator-core.service';

describe('SimulatorCoreService', () => {
  let service: SimulatorCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulatorCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
