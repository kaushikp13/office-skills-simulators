import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorCoreComponent } from './simulator-core.component';

describe('SimulatorCoreComponent', () => {
  let component: SimulatorCoreComponent;
  let fixture: ComponentFixture<SimulatorCoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SimulatorCoreComponent]
    });
    fixture = TestBed.createComponent(SimulatorCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
