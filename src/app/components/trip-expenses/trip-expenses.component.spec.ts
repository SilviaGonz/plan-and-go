import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripExpensesComponent } from './trip-expenses.component';

describe('TripExpensesComponent', () => {
  let component: TripExpensesComponent;
  let fixture: ComponentFixture<TripExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripExpensesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
