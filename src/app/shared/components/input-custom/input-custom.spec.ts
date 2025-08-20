import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCustom } from './input-custom';

describe('InputCustom', () => {
  let component: InputCustom;
  let fixture: ComponentFixture<InputCustom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCustom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputCustom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
