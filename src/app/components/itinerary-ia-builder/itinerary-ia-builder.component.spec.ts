import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryIaBuilderComponent } from './itinerary-ia-builder.component';

describe('ItineraryIaBuilderComponent', () => {
  let component: ItineraryIaBuilderComponent;
  let fixture: ComponentFixture<ItineraryIaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryIaBuilderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItineraryIaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
