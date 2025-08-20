import { TestBed } from '@angular/core/testing';

import { LayoutOptions } from './layout-options';

describe('LayoutOptions', () => {
  let service: LayoutOptions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutOptions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
