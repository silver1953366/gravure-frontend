import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayouComponentComponent } from './layou.component.component';

describe('LayouComponentComponent', () => {
  let component: LayouComponentComponent;
  let fixture: ComponentFixture<LayouComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayouComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayouComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
