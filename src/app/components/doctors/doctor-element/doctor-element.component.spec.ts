import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorElementComponent } from './doctor-element.component';

describe('DoctorElementComponent', () => {
  let component: DoctorElementComponent;
  let fixture: ComponentFixture<DoctorElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
