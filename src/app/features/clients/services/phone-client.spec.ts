import { TestBed } from '@angular/core/testing';

import { PhoneClient } from './phone-client';

describe('PhoneClient', () => {
  let service: PhoneClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhoneClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
