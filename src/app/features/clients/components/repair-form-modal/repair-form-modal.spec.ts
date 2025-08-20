import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairFormModal } from './repair-form-modal';

describe('RepairFormModal', () => {
  let component: RepairFormModal;
  let fixture: ComponentFixture<RepairFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
