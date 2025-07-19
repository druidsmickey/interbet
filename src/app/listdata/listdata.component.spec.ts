import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ListdataComponent } from './listdata.component';

describe('ListdataComponent', () => {
  let component: ListdataComponent;
  let fixture: ComponentFixture<ListdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListdataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
