import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCatalogComponent } from './room-catalog.component';

describe('RoomCatalogComponent', () => {
  let component: RoomCatalogComponent;
  let fixture: ComponentFixture<RoomCatalogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomCatalogComponent]
    });
    fixture = TestBed.createComponent(RoomCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
