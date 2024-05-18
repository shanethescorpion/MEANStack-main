import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatContactGroupComponent } from './chat-contact-group.component';

describe('ChatContactGroupComponent', () => {
  let component: ChatContactGroupComponent;
  let fixture: ComponentFixture<ChatContactGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatContactGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatContactGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
