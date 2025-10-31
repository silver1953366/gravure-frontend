import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimationToolComponent } from './estimation-tool.component';

describe('EstimationToolComponent', () => {
  let component: EstimationToolComponent;
  let fixture: ComponentFixture<EstimationToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimationToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimationToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
