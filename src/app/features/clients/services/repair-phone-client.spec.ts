import { TestBed } from '@angular/core/testing';

import { RepairPhoneClient } from './repair-phone-client';

describe('RepairPhoneClient', () => {
  let service: RepairPhoneClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepairPhoneClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
