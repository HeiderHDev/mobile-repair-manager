import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneRepairs } from './phone-repairs';

describe('PhoneRepairs', () => {
  let component: PhoneRepairs;
  let fixture: ComponentFixture<PhoneRepairs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneRepairs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneRepairs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
