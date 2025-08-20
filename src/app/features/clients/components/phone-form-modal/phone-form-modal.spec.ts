import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneFormModal } from './phone-form-modal';

describe('PhoneFormModal', () => {
  let component: PhoneFormModal;
  let fixture: ComponentFixture<PhoneFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
