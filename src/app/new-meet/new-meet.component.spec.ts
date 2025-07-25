import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMeetComponent } from './new-meet.component';

describe('NewMeetComponent', () => {
  let component: NewMeetComponent;
  let fixture: ComponentFixture<NewMeetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMeetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMeetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
