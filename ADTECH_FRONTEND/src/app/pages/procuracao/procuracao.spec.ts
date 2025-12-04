import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcuracaoComponent } from './procuracao';

describe('ProcuracaoComponent', () => {
  let component: ProcuracaoComponent;
  let fixture: ComponentFixture<ProcuracaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcuracaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcuracaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
