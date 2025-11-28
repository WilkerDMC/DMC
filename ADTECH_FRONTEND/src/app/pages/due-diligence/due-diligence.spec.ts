import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueDiligence } from './due-diligence';

describe('DueDiligence', () => {
  let component: DueDiligence;
  let fixture: ComponentFixture<DueDiligence>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueDiligence]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DueDiligence);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
