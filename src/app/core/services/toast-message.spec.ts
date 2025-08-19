import { TestBed } from '@angular/core/testing';

import { ToastMessage } from './toast-message';

describe('ToastMessage', () => {
  let service: ToastMessage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastMessage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
