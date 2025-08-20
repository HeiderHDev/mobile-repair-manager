import { TestBed } from '@angular/core/testing';

import { ClientData } from './client-data';

describe('ClientData', () => {
  let service: ClientData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
