import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPhones } from './client-phones';

describe('ClientPhones', () => {
  let component: ClientPhones;
  let fixture: ComponentFixture<ClientPhones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPhones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPhones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
