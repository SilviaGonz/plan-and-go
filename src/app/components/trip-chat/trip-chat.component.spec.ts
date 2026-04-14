import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripChatComponent } from './trip-chat.component';

describe('TripChatComponent', () => {
  let component: TripChatComponent;
  let fixture: ComponentFixture<TripChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripChatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
