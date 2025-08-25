import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRoomsComponent } from './admin-rooms.component';

describe('AdminRoomsComponent', () => {
  let component: AdminRoomsComponent;
  let fixture: ComponentFixture<AdminRoomsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminRoomsComponent]
    });
    fixture = TestBed.createComponent(AdminRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
